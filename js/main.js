import { AppState } from './AppState.js';
import { UI } from './UI.js';
import { AudioEngine } from './AudioEngine.js';
import { PresetManager } from './PresetManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    const appState = new AppState();
    const ui = new UI(appState);
    const audioEngine = new AudioEngine(appState);
    const presetManager = new PresetManager();

    let activeCellForSampling = null; // To track which cell to load the sample into
    let currentSampleFolderPath = ''; // Tracks the current path in the sample library modal
    let recordTimeUpdater = null;

    // --- Initialization ---
    async function initialize() {
        updateUserPresetList();
        setupEventListeners();
        console.log('Application initialized and event listeners set up.');
    }

    // --- Data Fetching ---
    async function fetchSampleContent(folderPath = '') {
        try {
            const response = await fetch(`/list-samples-content/${folderPath}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data; // { folders: [], files: [] }
        } catch (error) {
            console.error(`Could not fetch sample content for ${folderPath}:`, error);
            alert('Could not load sample library content. Make sure the server is running and the samples folder exists.');
            return { folders: [], files: [] };
        }
    }

    // --- Preset Management ---
    function updateUserPresetList() {
        const presets = presetManager.getPresetList();
        ui.updatePresetList(presets);
    }

    async function loadPreset(name) {
        const loadedState = presetManager.loadPreset(name);
        if (loadedState) {
            audioEngine.stopAllClips();
            appState.setState(loadedState);
            await loadSamplesForPreset(loadedState);
            audioEngine.updateAllPlayingClipsTempo();
            ui.render(); // Full re-render to reflect loaded state
            alert(`Preset '${name}' loaded.`);
        } else {
            alert('Failed to load preset.');
        }
    }

    async function loadSamplesForPreset(state) {
        for (let r = 0; r < state.grid.length; r++) {
            for (let c = 0; c < state.grid[r].length; c++) {
                const cell = state.grid[r][c];
                if (cell.sample && cell.sample.path) {
                    try {
                        const sample = await audioEngine.loadSampleFromPath(cell.sample.path);
                        appState.setClip(r, c, sample);
                    } catch (error) {
                        console.error(`Failed to load sample ${cell.sample.path} for cell ${r},${c}`, error);
                        // Optionally mark this cell as failed to load
                    }
                }
            }
        }
    }

    // --- Sample Library Modal Logic ---
    async function openSampleLibrary(row, col) {
        activeCellForSampling = { row, col };
        currentSampleFolderPath = ''; // Start at root
        await updateSampleLibraryModal();
    }

    async function updateSampleLibraryModal() {
        const content = await fetchSampleContent(currentSampleFolderPath);
        console.log('Content received for modal:', content); // Add this line
        const title = currentSampleFolderPath ? `Samples / ${currentSampleFolderPath}` : 'Sample Library';
        ui.showSampleLibrary(title, content);
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // AppState Subscriptions
        appState.subscribe(() => {
            ui.renderRightPanel();
            ui.renderTrackHeaderControls();
        });

        const originalSetCurrentBeat = appState.setCurrentBeat.bind(appState);
        appState.setCurrentBeat = (beat) => {
            originalSetCurrentBeat(beat);
            ui.updateBeatHighlight(beat);
        };

        const originalSetTempo = appState.setTempo.bind(appState);
        appState.setTempo = (newTempo) => {
            originalSetTempo(newTempo);
            audioEngine.updateAllPlayingClipsTempo();
        };

        // Grid Cell Click
        ui.gridCellsWrapper.addEventListener('click', (e) => {
            const cell = e.target.closest('.grid-cell');
            if (!cell || e.target.classList.contains('clip-volume-slider')) return;

            const row = parseInt(cell.dataset.row, 10);
            const col = parseInt(cell.dataset.col, 10);
            const cellData = appState.grid[row][col];

            if (!cellData.sample || appState.isReplaceMode) {
                openSampleLibrary(row, col);
            } else {
                audioEngine.start();
                if (cellData.state === 'stopped') appState.setClipState(row, col, 'pending');
                else if (cellData.state === 'playing') appState.setClipState(row, col, 'stopping');
                else {
                    audioEngine.stopClip(row, col);
                    appState.setClipState(row, col, 'stopped');
                }
            }
        });

        // Sample Library Modal Interactions
        document.getElementById('sample-list').addEventListener('click', async (e) => {
            const item = e.target.closest('.sample-item, .folder-item');
            if (!item) return;

            const type = item.dataset.type;
            const name = item.dataset.name || item.dataset.path; // For files, name is path

            if (type === 'folder') {
                if (currentSampleFolderPath) {
                    currentSampleFolderPath = `${currentSampleFolderPath}/${name}`;
                } else {
                    currentSampleFolderPath = name;
                }
                await updateSampleLibraryModal();
            } else if (type === 'file' && activeCellForSampling) {
                const { row, col } = activeCellForSampling;
                try {
                    const sample = await audioEngine.loadSampleFromPath(name);
                    appState.setClip(row, col, sample);
                    ui.hideSampleLibrary();
                    activeCellForSampling = null;
                } catch (error) {
                    console.error('Error loading sample:', error);
                    alert('Failed to load the selected sample.');
                }
            }
        });

        document.getElementById('close-modal-button').addEventListener('click', () => {
            ui.hideSampleLibrary();
            activeCellForSampling = null;
        });

        document.getElementById('back-button').addEventListener('click', async () => {
            const pathParts = currentSampleFolderPath.split('/').filter(p => p);
            if (pathParts.length > 0) {
                pathParts.pop();
                currentSampleFolderPath = pathParts.join('/');
            }
            await updateSampleLibraryModal();
        });

        // Right Panel Controls
        ui.rightPanelContainer.addEventListener('click', (e) => {
            const targetId = e.target.id;
            if (targetId === 'replace-sample-button') appState.toggleReplaceMode();
            else if (targetId === 'stop-all-button') audioEngine.stopAllClips();
            else if (targetId === 'clear-grid-button') {
                if (confirm('Are you sure you want to clear the grid?')) {
                    audioEngine.stopAllClips();
                    appState.resetGridAndTempo();
                }
            }
            else if (targetId === 'record-button') {
                appState.toggleRecording();
                if (appState.isRecording) {
                    appState.setRecordingStartTime(Date.now());
                    audioEngine.startRecording();
                    recordTimeUpdater = setInterval(() => {
                        const elapsed = (Date.now() - appState.recordingStartTime) / 1000;
                        ui.updateRecordTime(elapsed);
                    }, 1000);
                } else {
                    audioEngine.stopRecording();
                    clearInterval(recordTimeUpdater);
                    ui.updateRecordTime(0);
                }
            }
            else if (targetId === 'save-recording-button') {
                if (appState.recordedBlob) {
                    const url = URL.createObjectURL(appState.recordedBlob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `recording-${new Date().toISOString()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            }
        });

        // Preset Controls
        document.getElementById('save-preset-button').addEventListener('click', () => {
            const nameInput = document.getElementById('preset-name-input');
            const name = nameInput.value.trim();
            if (name) {
                if (presetManager.savePreset(name, appState.getState())) {
                    alert(`Preset '${name}' saved.`);
                    nameInput.value = '';
                    updateUserPresetList();
                } else alert('Failed to save preset.');
            } else alert('Please enter a preset name.');
        });

        document.getElementById('load-preset-button').addEventListener('click', () => {
            const select = document.getElementById('preset-select');
            if (select.value) loadPreset(select.value);
            else alert('Please select a preset to load.');
        });

        document.getElementById('delete-preset-button').addEventListener('click', () => {
            const select = document.getElementById('preset-select');
            const name = select.value;
            if (name) {
                if (confirm(`Are you sure you want to delete the preset '${name}'?`)) {
                    if (presetManager.deletePreset(name)) {
                        alert(`Preset '${name}' deleted.`);
                        updateUserPresetList();
                    } else alert('Failed to delete preset.');
                }
            } else alert('Please select a preset to delete.');
        });

        // Export Preset
        document.getElementById('export-preset-button').addEventListener('click', () => {
            const select = document.getElementById('preset-select');
            const name = select.value;
            if (name) {
                const presetData = presetManager.loadPreset(name);
                if (presetData) {
                    const jsonString = JSON.stringify(presetData, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${name}.sequencer-preset`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    alert(`Preset '${name}' exported successfully.`);
                } else {
                    alert('Failed to load preset data for export.');
                }
            } else {
                alert('Please select a preset to export.');
            }
        });

        // Import Preset
        document.getElementById('import-preset-button').addEventListener('click', () => {
            document.getElementById('import-preset-file-input').click();
        });

        document.getElementById('import-preset-file-input').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        // Assuming the imported data is a valid state object
                        // We need a name for the imported preset
                        const presetName = prompt('Enter a name for the imported preset:', file.name.split('.')[0]);
                        if (presetName) {
                            if (presetManager.savePreset(presetName, importedData)) {
                                alert(`Preset '${presetName}' imported and saved.`);
                                updateUserPresetList();
                            } else {
                                alert('Failed to save imported preset.');
                            }
                        } else {
                            alert('Preset import cancelled: No name provided.');
                        }
                    } catch (error) {
                        console.error('Error parsing imported preset file:', error);
                        alert('Invalid preset file. Please select a valid .json or .sequencer-preset file.');
                    }
                };
                reader.readAsText(file);
            }
        });

        // Track Header Controls
        ui.trackHeaderControlsContainer.addEventListener('click', (e) => {
            const muteButton = e.target.closest('.mute-button');
            const soloButton = e.target.closest('.solo-button');
            if (muteButton) {
                const col = parseInt(muteButton.dataset.col, 10);
                appState.toggleTrackMute(col);
                audioEngine.updateMuteSoloState();
            } else if (soloButton) {
                const col = parseInt(soloButton.dataset.col, 10);
                appState.toggleTrackSolo(col);
                audioEngine.updateMuteSoloState();
            }
        });

        // Volume and Tempo Sliders
        ui.gridCellsWrapper.addEventListener('input', (e) => {
            const slider = e.target.closest('.clip-volume-slider');
            if (slider) {
                e.stopPropagation();
                const row = parseInt(slider.dataset.row, 10);
                const col = parseInt(slider.dataset.col, 10);
                const volume = parseFloat(slider.value);
                appState.setClipVolume(row, col, volume);
                audioEngine.setPlayingClipVolume(row, col, volume);
            }
        });

        ui.rightPanelContainer.addEventListener('input', (e) => {
            if (e.target.id === 'tempo-slider') {
                appState.setTempo(parseFloat(e.target.value));
            }
        });
    }

    // --- Start the application ---
    initialize();
});