export class UI {
    constructor(appState) {
        this.appState = appState;
        this.gridContainer = document.getElementById('grid-container'); // 변경
        this.gridCellsWrapper = document.getElementById('grid-cells-wrapper'); // 추가
        this.rightPanelContainer = document.getElementById('right-panel');
        this.trackHeaderControlsContainer = document.getElementById('track-header-controls'); // 변경

        // DOM 요소들을 한 번만 생성
        this.createRightPanelElements();
        this.createTrackHeaderElements();

        // AppState의 변경을 구독하여 UI를 다시 렌더링
        this.appState.subscribe(() => this.render());

        // 초기 렌더링
        this.render();
    }

    render() {
        this.renderGrid();
        this.renderRightPanel();
        this.renderTrackHeaderControls();
    }

    renderGrid() {
        this.gridCellsWrapper.innerHTML = '';
        this.gridCellsWrapper.style.gridTemplateColumns = `repeat(${this.appState.cols}, 1fr)`;
        this.gridCellsWrapper.style.gridTemplateRows = `repeat(${this.appState.rows}, 1fr)`;

        for (let row = 0; row < this.appState.rows; row++) { // 행 범위 10으로 변경
            for (let col = 0; col < this.appState.cols; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.classList.add(`col-${col}`); // Add column-specific class
                cell.dataset.row = row;
                cell.dataset.col = col;

                const cellData = this.appState.grid[row][col];

                cell.innerHTML = '';

                if (cellData.sample && cellData.sample.name) {
                    cell.classList.add('has-sample');

                    const nameDiv = document.createElement('div');
                    nameDiv.className = 'clip-name';
                    const fileName = cellData.sample.name.split('.').slice(0, -1).join('.');
                    nameDiv.textContent = fileName;
                    cell.appendChild(nameDiv);

                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.min = 0;
                    slider.max = 1;
                    slider.step = 0.01;
                    slider.value = cellData.volume;
                    slider.className = 'clip-volume-slider';
                    slider.dataset.row = row;
                    slider.dataset.col = col;
                    cell.appendChild(slider);
                }

                if (cellData.state === 'pending') {
                    cell.classList.add('pending');
                } else if (cellData.state === 'playing') {
                    cell.classList.add('playing');
                } else if (cellData.state === 'stopping') {
                    cell.classList.add('stopping');
                }

                this.gridCellsWrapper.appendChild(cell); // 변경
            }
        }
    }

    createRightPanelElements() {
        const rightPanel = this.rightPanelContainer;

        // Replace Sample 버튼
        const replaceButton = document.createElement('button');
        replaceButton.id = 'replace-sample-button';
        replaceButton.classList.add('control-button');
        replaceButton.textContent = 'Replace Sample';
        rightPanel.appendChild(replaceButton);

        // Stop All 버튼
        const stopAllButton = document.createElement('button');
        stopAllButton.id = 'stop-all-button';
        stopAllButton.classList.add('control-button');
        stopAllButton.textContent = 'STOP ALL';
        rightPanel.appendChild(stopAllButton);

        // 녹음 시작/정지 버튼
        const recordButton = document.createElement('button');
        recordButton.id = 'record-button';
        recordButton.classList.add('control-button');
        recordButton.textContent = 'REC';
        rightPanel.appendChild(recordButton);

        // 녹음 시간 표시
        const recordTimeDisplay = document.createElement('div');
        recordTimeDisplay.id = 'record-time-display';
        recordTimeDisplay.textContent = '00:00';
        recordTimeDisplay.style.color = '#fff';
        recordTimeDisplay.style.fontSize = '1.2em';
        recordTimeDisplay.style.marginTop = '10px';
        rightPanel.appendChild(recordTimeDisplay);

        // 저장 버튼
        const saveButton = document.createElement('button');
        saveButton.id = 'save-recording-button';
        saveButton.classList.add('control-button');
        saveButton.textContent = 'Save Recording';
        rightPanel.appendChild(saveButton);

        // Clear Grid 버튼
        const clearGridButton = document.createElement('button');
        clearGridButton.id = 'clear-grid-button';
        clearGridButton.classList.add('control-button');
        clearGridButton.textContent = 'Clear Grid';
        rightPanel.appendChild(clearGridButton);

        // 템포 조절 UI
        const tempoControlDiv = document.createElement('div');
        tempoControlDiv.id = 'tempo-control-div';
        tempoControlDiv.style.marginTop = '20px';
        tempoControlDiv.style.display = 'flex';
        tempoControlDiv.style.flexDirection = 'column';
        tempoControlDiv.style.gap = '5px';

        const tempoLabel = document.createElement('label');
        tempoLabel.id = 'tempo-label';
        tempoControlDiv.appendChild(tempoLabel);

        const tempoSlider = document.createElement('input');
        tempoSlider.type = 'range';
        tempoSlider.id = 'tempo-slider';
        tempoSlider.min = 60;
        tempoSlider.max = 240;
        tempoSlider.step = 1;
        tempoSlider.classList.add('control-slider');
        tempoControlDiv.appendChild(tempoSlider);

        rightPanel.appendChild(tempoControlDiv);

        // --- Preset Management UI ---
        const presetContainer = document.createElement('div');
        presetContainer.id = 'preset-container';
        presetContainer.style.marginTop = '20px';
        presetContainer.style.borderTop = '1px solid #555';
        presetContainer.style.paddingTop = '10px';

        const presetTitle = document.createElement('h4');
        presetTitle.textContent = 'Presets';
        presetTitle.style.margin = '0 0 10px 0';
        presetContainer.appendChild(presetTitle);

        const presetNameInput = document.createElement('input');
        presetNameInput.type = 'text';
        presetNameInput.id = 'preset-name-input';
        presetNameInput.placeholder = 'Preset Name';
        presetNameInput.style.width = '100%';
        presetNameInput.style.marginBottom = '5px';
        presetContainer.appendChild(presetNameInput);

        const presetActionContainer = document.createElement('div');
        presetActionContainer.style.display = 'flex';
        presetActionContainer.style.gap = '5px';
        presetActionContainer.style.flexWrap = 'wrap'; // Add this line

        const savePresetButton = document.createElement('button');
        savePresetButton.id = 'save-preset-button';
        savePresetButton.textContent = 'Save';
        savePresetButton.classList.add('control-button');
        savePresetButton.style.width = 'calc(50% - 2.5px)'; // Adjust width
        presetActionContainer.appendChild(savePresetButton);

        const deletePresetButton = document.createElement('button');
        deletePresetButton.id = 'delete-preset-button';
        deletePresetButton.textContent = 'Delete';
        deletePresetButton.classList.add('control-button');
        deletePresetButton.style.width = 'calc(50% - 2.5px)'; // Adjust width
        presetActionContainer.appendChild(deletePresetButton);
        
        presetContainer.appendChild(presetActionContainer);

        const presetSelect = document.createElement('select');
        presetSelect.id = 'preset-select';
        presetSelect.style.width = '100%';
        presetSelect.style.marginTop = '10px';
        presetContainer.appendChild(presetSelect);

        const loadPresetButton = document.createElement('button');
        loadPresetButton.id = 'load-preset-button';
        loadPresetButton.textContent = 'Load Selected';
        loadPresetButton.classList.add('control-button');
        loadPresetButton.style.marginTop = '5px';
        presetContainer.appendChild(loadPresetButton);

        // Export/Import Buttons
        const exportImportContainer = document.createElement('div');
        exportImportContainer.style.display = 'flex';
        exportImportContainer.style.gap = '5px';
        exportImportContainer.style.marginTop = '10px';
        exportImportContainer.style.flexWrap = 'wrap'; // Add this line

        const exportButton = document.createElement('button');
        exportButton.id = 'export-preset-button';
        exportButton.textContent = 'Export';
        exportButton.classList.add('control-button');
        exportButton.style.width = 'calc(50% - 2.5px)'; // Adjust width
        exportImportContainer.appendChild(exportButton);

        const importButton = document.createElement('button');
        importButton.id = 'import-preset-button';
        importButton.textContent = 'Import';
        importButton.classList.add('control-button');
        importButton.style.width = 'calc(50% - 2.5px)'; // Adjust width
        exportImportContainer.appendChild(importButton);

        presetContainer.appendChild(exportImportContainer);

        rightPanel.appendChild(presetContainer);
    }

    createTrackHeaderElements() {
        const trackHeader = this.trackHeaderControlsContainer;
        trackHeader.innerHTML = ''; // Clear existing controls
        trackHeader.style.gridTemplateColumns = `repeat(${this.appState.cols}, 1fr)`;

        for (let i = 0; i < this.appState.cols; i++) {
            const controlGroup = document.createElement('div');
            controlGroup.classList.add('track-control-group');
            controlGroup.dataset.col = i;

            const muteButton = document.createElement('button');
            muteButton.id = `mute-button-${i}`;
            muteButton.classList.add('track-control-button', 'mute-button');
            muteButton.textContent = 'M';
            muteButton.dataset.col = i;
            controlGroup.appendChild(muteButton);

            const soloButton = document.createElement('button');
            soloButton.id = `solo-button-${i}`;
            soloButton.classList.add('track-control-button', 'solo-button');
            soloButton.textContent = 'S';
            soloButton.dataset.col = i;
            controlGroup.appendChild(soloButton);

            trackHeader.appendChild(controlGroup);
        }
    }

    renderRightPanel() {
        // Replace Sample 버튼
        const replaceButton = document.getElementById('replace-sample-button');
        if (replaceButton) {
            replaceButton.classList.toggle('active', this.appState.isReplaceMode);
        }

        // 녹음 시작/정지 버튼
        const recordButton = document.getElementById('record-button');
        if (recordButton) {
            recordButton.textContent = this.appState.isRecording ? 'STOP REC' : 'REC';
            recordButton.classList.toggle('active', this.appState.isRecording);
        }

        // 저장 버튼
        const saveButton = document.getElementById('save-recording-button');
        if (saveButton) {
            saveButton.disabled = !this.appState.recordedBlob;
        }

        // 템포 조절 UI 업데이트
        this.updateTempoDisplay(this.appState.tempo);
    }

    renderTrackHeaderControls() {
        for (let i = 0; i < this.appState.cols; i++) {
            const muteButton = document.getElementById(`mute-button-${i}`);
            const soloButton = document.getElementById(`solo-button-${i}`);

            if (muteButton) {
                muteButton.classList.toggle('active', this.appState.trackMutes[i]);
            }
            if (soloButton) {
                soloButton.classList.toggle('active', this.appState.trackSolos[i]);
            }
        }
    }

    updateBeatHighlight(currentBeat) {
        const prevHighlightedCells = this.gridCellsWrapper.querySelectorAll('.current-beat'); // 변경
        prevHighlightedCells.forEach(cell => {
            cell.classList.remove('current-beat');
        });

        // Force reflow on the parent container after all classes are removed
        void this.gridCellsWrapper.offsetWidth;

        const beatColumn = currentBeat % this.appState.cols;
        for (let row = 0; row < this.appState.rows; row++) { // 행 범위 10으로 변경
            const cell = this.gridCellsWrapper.querySelector(`[data-row="${row}"][data-col="${beatColumn}"]`); // 변경
            if (cell && this.appState.grid[row][beatColumn].state === 'playing') {
                cell.classList.add('current-beat');
            }
        }
    }

    updateRecordTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const formattedTime = 
            `${minutes.toString().padStart(2, '0')}:
            ${seconds.toString().padStart(2, '0')}`;
        
        const display = document.getElementById('record-time-display');
        if (display) {
            display.textContent = formattedTime;
        }
    }

    updateTempoDisplay(tempo) {
        const label = document.getElementById('tempo-label');
        const slider = document.getElementById('tempo-slider');

        if (label) label.textContent = `Tempo: ${tempo} BPM`;
        if (slider) slider.value = tempo;
    }

    updatePresetList(presets) {
        const select = document.getElementById('preset-select');
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '<option value="">Select Preset...</option>'; // Default option

        presets.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });

        // Try to restore the previously selected value
        if (presets.includes(currentVal)) {
            select.value = currentVal;
        }
    }

    // --- Sample Library Modal ---
    showSampleLibrary(title, content) {
        console.log('UI.showSampleLibrary called with title:', title, 'and content:', content); // Add this line
        const modal = document.getElementById('sample-library-modal');
        const modalTitle = document.getElementById('modal-title');
        const backButton = document.getElementById('back-button');
        const sampleListContainer = document.getElementById('sample-list');

        modalTitle.textContent = title;
        sampleListContainer.innerHTML = ''; // Clear previous content

        if (content.folders) {
            console.log('Populating folders:', content.folders); // Add this line
            // Display folders
            content.folders.forEach(folderName => {
                const item = document.createElement('div');
                item.classList.add('folder-item');
                item.textContent = folderName;
                item.dataset.name = folderName;
                item.dataset.type = 'folder';
                sampleListContainer.appendChild(item);
            });
        }

        if (content.files) {
            // Display files
            content.files.forEach(filePath => {
                const fileName = filePath.split('/').pop();
                const item = document.createElement('div');
                item.classList.add('sample-item');
                item.textContent = fileName;
                item.dataset.path = filePath;
                item.dataset.type = 'file';
                sampleListContainer.appendChild(item);
            });
        }

        backButton.style.display = (title !== 'Sample Library') ? 'block' : 'none'; // Show back button if not root
        modal.style.display = 'flex';
    }

    hideSampleLibrary() {
        const modal = document.getElementById('sample-library-modal');
        modal.style.display = 'none';
    }
}
