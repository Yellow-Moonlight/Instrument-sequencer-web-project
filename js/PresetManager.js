export class PresetManager {
    constructor(prefix = 'sequencer_preset_') {
        this.prefix = prefix;
    }

    // 상태를 저장하기 전에 오디오 버퍼를 제외하여 직렬화 가능한 객체로 만듭니다.
    _createSavableState(state) {
        const savableGrid = state.grid.map(row => 
            row.map(cell => {
                if (cell.sample && cell.sample.path) {
                    // buffer를 제외하고 경로와 이름만 저장합니다.
                    return {
                        ...cell,
                        sample: {
                            name: cell.sample.name,
                            path: cell.sample.path
                        }
                    };
                } 
                return { ...cell, sample: null }; // 샘플이 없거나 경로가 없으면 null 처리
            })
        );

        return { ...state, grid: savableGrid };
    }

    savePreset(name, state) {
        if (!name) {
            console.error('Preset name cannot be empty.');
            return false;
        }
        try {
            const savableState = this._createSavableState(state);
            const jsonState = JSON.stringify(savableState);
            localStorage.setItem(this.prefix + name, jsonState);
            console.log(`Preset '${name}' saved.`);
            return true;
        } catch (error) {
            console.error(`Failed to save preset '${name}'.`, error);
            return false;
        }
    }

    loadPreset(name) {
        try {
            const jsonState = localStorage.getItem(this.prefix + name);
            if (jsonState) {
                const loadedState = JSON.parse(jsonState);
                console.log(`Preset '${name}' loaded.`);
                return loadedState;
            }
            return null;
        } catch (error) {
            console.error(`Failed to load preset '${name}'.`, error);
            return null;
        }
    }

    deletePreset(name) {
        try {
            localStorage.removeItem(this.prefix + name);
            console.log(`Preset '${name}' deleted.`);
            return true;
        } catch (error) {
            console.error(`Failed to delete preset '${name}'.`, error);
            return false;
        }
    }

    getPresetList() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .map(key => key.replace(this.prefix, ''));
    }
}
