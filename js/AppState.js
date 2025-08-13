export class AppState {
    constructor() {
        this.rows = 6;
        this.cols = 5;

        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null).map(() => ({
            sample: null,
            state: 'stopped',
            volume: 0.8
        })));

        this.tempo = 120;
        this.isReplaceMode = false;
        this.currentBeat = 0;

        this.isRecording = false;
        this.recordingStartTime = 0;
        this.recordedBlob = null;

        this.trackMutes = Array(this.cols).fill(false);
        this.trackSolos = Array(this.cols).fill(false);

        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        for (const listener of this.listeners) {
            listener(this);
        }
    }

    setClip(row, col, sample) {
        if (this.grid[row] && this.grid[row][col]) {
            this.grid[row][col].sample = sample;
            this.notify();
        }
    }

    setClipState(row, col, state) {
        if (this.grid[row] && this.grid[row][col]) {
            this.grid[row][col].state = state;
            this.notify();
        }
    }

    setClipVolume(row, col, volume) {
        if (this.grid[row] && this.grid[row][col]) {
            this.grid[row][col].volume = volume;
            this.notify();
        }
    }

    toggleReplaceMode() {
        this.isReplaceMode = !this.isReplaceMode;
        this.notify();
    }

    setCurrentBeat(beat) {
        if (this.currentBeat !== beat) {
            this.currentBeat = beat;
        }
    }

    toggleRecording() {
        this.isRecording = !this.isRecording;
        this.notify();
    }

    setRecordingStartTime(time) {
        this.recordingStartTime = time;
        this.notify();
    }

    setRecordedBlob(blob) {
        this.recordedBlob = blob;
        this.notify();
    }

    setTempo(newTempo) {
        this.tempo = newTempo;
        this.notify();
    }

    toggleTrackMute(colIndex) {
        if (colIndex >= 0 && colIndex < this.cols) {
            this.trackMutes[colIndex] = !this.trackMutes[colIndex];
            // 음소거 시 솔로 해제
            if (this.trackMutes[colIndex] && this.trackSolos[colIndex]) {
                this.trackSolos[colIndex] = false;
            }
            this.notify();
        }
    }

    toggleTrackSolo(colIndex) {
        if (colIndex >= 0 && colIndex < this.cols) {
            this.trackSolos[colIndex] = !this.trackSolos[colIndex];
            // 솔로 시 다른 모든 트랙 음소거
            if (this.trackSolos[colIndex]) {
                for (let i = 0; i < this.cols; i++) {
                    if (i !== colIndex) {
                        this.trackMutes[i] = true;
                        this.trackSolos[i] = false; // 다른 솔로 해제
                    }
                }
                this.trackMutes[colIndex] = false; // 솔로 트랙은 음소거 해제
            } else {
                // 솔로 해제 시 모든 트랙 음소거 해제 (다른 솔로 트랙이 없는 경우)
                const anyOtherSolo = this.trackSolos.some((isSolo, idx) => isSolo && idx !== colIndex);
                if (!anyOtherSolo) {
                    this.trackMutes.fill(false);
                }
            }
            this.notify();
        }
    }

    resetGridAndTempo() {
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null).map(() => ({
            sample: null,
            state: 'stopped',
            volume: 0.8
        })));
        this.tempo = 120;
        this.trackMutes.fill(false);
        this.trackSolos.fill(false);
        this.notify();
    }

    // 현재 상태를 내보내는 메소드
    getState() {
        return {
            grid: this.grid,
            tempo: this.tempo,
            trackMutes: this.trackMutes,
            trackSolos: this.trackSolos,
        };
    }

    // 외부 상태로 앱 상태를 설정하는 메소드
    setState(newState) {
        // 간단한 유효성 검사
        if (newState && newState.grid && newState.tempo) {
            this.grid = newState.grid;
            this.tempo = newState.tempo;
            this.trackMutes = newState.trackMutes || Array(this.cols).fill(false);
            this.trackSolos = newState.trackSolos || Array(this.cols).fill(false);
            
            // 다른 상태들도 필요에 따라 복원
            this.isReplaceMode = false;
            this.currentBeat = 0;
            this.isRecording = false;
            this.recordedBlob = null;

            console.log('App state restored from preset.');
            this.notify();
        } else {
            console.error('Invalid state object for setState.');
        }
    }
}