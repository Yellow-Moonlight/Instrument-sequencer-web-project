export class AudioEngine {
    constructor(appState) {
        this.appState = appState;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.playingSources = Array(this.appState.rows).fill(null).map(() => Array(this.appState.cols).fill(null).map(() => ({ source: null, gainNode: null })));
        
        this.timerID = null;
        this.lookahead = 25.0;
        this.scheduleAheadTime = 0.1;
        this.nextNoteTime = 0.0;
        this.current16thNote = 0;

        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.connect(this.audioContext.destination);

        this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
        this.masterGainNode.connect(this.mediaStreamDestination);
    }

    start() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        if (this.timerID) return;

        this.nextNoteTime = this.audioContext.currentTime + 0.1;
        this.timerID = setInterval(() => this.scheduler(), this.lookahead);
        console.log('Audio scheduler started.');
    }

    scheduler() {
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleClips(this.nextNoteTime);
            this.advanceNote();
        }
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.appState.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat;
        this.current16thNote = (this.current16thNote + 1) % this.appState.cols;
        this.appState.setCurrentBeat(this.current16thNote);
    }

    scheduleClips(time) {
        if (this.current16thNote !== 0) return;

        for (let row = 0; row < this.appState.rows; row++) {
            for (let col = 0; col < this.appState.cols; col++) {
                const cell = this.appState.grid[row][col];
                if (cell.state === 'pending') {
                    this.playClip(row, col, time);
                    this.appState.setClipState(row, col, 'playing');
                } else if (cell.state === 'stopping') {
                    this.stopClip(row, col);
                    this.appState.setClipState(row, col, 'stopped');
                }
            }
        }
    }

    playClip(row, col, time) {
        const cell = this.appState.grid[row][col];
        if (!cell.sample || !cell.sample.buffer) {
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = cell.sample.buffer;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = Math.pow(cell.volume, 2); 
        source.connect(gainNode);
        gainNode.connect(this.masterGainNode);

        const sampleDuration = source.buffer.duration;
        const barDuration = (60.0 / this.appState.tempo) * 4;
        const targetDurations = [barDuration, barDuration * 2, barDuration * 3, barDuration * 4];
        
        const closestDuration = targetDurations.reduce((prev, curr) => 
            Math.abs(curr - sampleDuration) < Math.abs(prev - sampleDuration) ? curr : prev
        );

        const playbackRate = sampleDuration / closestDuration;
        source.playbackRate.value = playbackRate;

        source.loop = true;
        source.start(time);

        this.stopClip(row, col); // 기존에 재생중인 소스가 있다면 정지
        this.playingSources[row][col] = { source, gainNode };

        source.onended = () => {
            if (this.appState.grid[row][col].state === 'playing') {
                this.appState.setClipState(row, col, 'stopped');
                this.playingSources[row][col] = { source: null, gainNode: null };
            }
        };
    }

    setPlayingClipVolume(row, col, volume) {
        const playingClip = this.playingSources[row][col];
        if (playingClip && playingClip.gainNode) {
            playingClip.gainNode.gain.value = Math.pow(volume, 2);
        }
    }

    stopClip(row, col) {
        const playingClip = this.playingSources[row][col];
        if (playingClip && playingClip.source) {
            playingClip.source.stop(0);
            playingClip.source.disconnect();
            playingClip.gainNode.disconnect();
            this.playingSources[row][col] = { source: null, gainNode: null };
        }
    }

    stopAllClips() {
        for (let row = 0; row < this.appState.rows; row++) {
            for (let col = 0; col < this.appState.cols; col++) {
                this.stopClip(row, col);
                this.appState.setClipState(row, col, 'stopped');
            }
        }
    }

    updateMuteSoloState() {
        const isAnyTrackSoloed = this.appState.trackSolos.some(s => s);

        for (let row = 0; row < this.appState.rows; row++) {
            for (let col = 0; col < this.appState.cols; col++) {
                const playingClip = this.playingSources[row][col];
                if (playingClip && playingClip.gainNode) {
                    const cell = this.appState.grid[row][col];
                    const isMuted = this.appState.trackMutes[col];
                    const isSoloed = this.appState.trackSolos[col];

                    let targetGain = Math.pow(cell.volume, 2);

                    if (isMuted) {
                        targetGain = 0;
                    } else if (isAnyTrackSoloed && !isSoloed) {
                        targetGain = 0;
                    }
                    
                    playingClip.gainNode.gain.setTargetAtTime(targetGain, this.audioContext.currentTime, 0.01);
                }
            }
        }
    }

    updateAllPlayingClipsTempo() {
        for (let row = 0; row < this.appState.rows; row++) {
            for (let col = 0; col < this.appState.cols; col++) {
                const playingClip = this.playingSources[row][col];
                const cell = this.appState.grid[row][col];
                if (playingClip && playingClip.source && cell.sample && cell.sample.originalPlaybackRate) {
                    playingClip.source.playbackRate.value = cell.sample.originalPlaybackRate * (this.appState.tempo / 120);
                }
            }
        }
    }

    async loadSampleFromPath(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        const sampleDuration = audioBuffer.duration;
        const barDuration120BPM = 2.0; // 120 BPM 4/4박자 기준 한 마디는 2초
        const targetDurations = [barDuration120BPM, barDuration120BPM * 2, barDuration120BPM * 4, barDuration120BPM * 8];
        
        const closestDuration = targetDurations.reduce((prev, curr) => 
            Math.abs(curr - sampleDuration) < Math.abs(prev - sampleDuration) ? curr : prev
        );

        const originalPlaybackRate = sampleDuration / closestDuration;

        return { 
            name: path.split('/').pop(), 
            path: path, // Store the path for presets
            buffer: audioBuffer, 
            originalPlaybackRate: originalPlaybackRate 
        };
    }

    startRecording() {
        if (!this.mediaRecorder) {
            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(this.mediaStreamDestination.stream);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                this.appState.setRecordedBlob(blob);
                this.recordedChunks = [];
            };
        }
        this.mediaRecorder.start();
        console.log('Recording started.');
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            console.log('Recording stopped.');
        }
    }
}