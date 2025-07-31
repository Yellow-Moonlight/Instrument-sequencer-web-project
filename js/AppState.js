/**
 * Manages the entire state of the instrument sequencer application.
 * Follows the structure defined in docs/design.md.
 */
export class AppState {
    constructor() {
        this.state = {
            viewMode: 'edit', // 'edit' or 'present'
            tempo: 120,
            grid: {
                rows: 8,
                cols: 8
            },
            tracks: Array(8).fill({ volume: 1.0, pitch: 0 }),
            clips: Array(8).fill(null).map(() => 
                Array(8).fill({ samplePath: null, state: 'empty', audioBuffer: null, pitch: 0 })
            )
        };
    }

    /**
     * Returns the current state.
     * @returns {object} The application state.
     */
    getState() {
        return this.state;
    }

    /**
     * Updates a property in the state.
     * @param {string} key - The top-level state key to update.
     * @param {*} value - The new value.
     */
    setState(key, value) {
        if (key in this.state) {
            this.state[key] = value;
            console.log(`State updated: ${key} =`, value);
        } else {
            console.error(`Error: Invalid state key "${key}".`);
        }
    }

    /**
     * Gets a specific clip's state.
     * @param {number} row - The clip's row index.
     * @param {number} col - The clip's column index.
     * @returns {object} The clip object.
     */
    getClip(row, col) {
        return this.state.clips[row]?.[col];
    }

    /**
     * Updates a specific clip's state.
     * @param {number} row - The clip's row index.
     * @param {number} col - The clip's column index.
     * @param {object} newClipState - The new state for the clip.
     */
    updateClip(row, col, newClipState) {
        if (this.state.clips[row]?.[col]) {
            Object.assign(this.state.clips[row][col], newClipState);
        }
    }
}