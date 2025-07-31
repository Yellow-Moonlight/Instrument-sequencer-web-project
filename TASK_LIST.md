# Instrument Sequencer Task Checklist

This checklist breaks down the development of the Instrument Sequencer project into logical steps. Each step concludes with a commit point to ensure atomic changes [AC] and maintain a clean history [CD].

## Phase 1: Project Setup & Core Architecture

- [ ] **Task 1: Initialize Project Structure**
    - [ ] Create base directories: `/css`, `/js`, `/samples`.
    - [ ] Create empty files: `index.html`, `css/style.css`, `js/main.js`, `js/AppState.js`, `js/UI.js`, `js/AudioEngine.js`.
    - [ ] Add placeholder content to `index.html` and `css/style.css`.
    - [ ] **COMMIT:** `feat(project): initialize file and folder structure`

- [ ] **Task 2: Implement Core State Management (`AppState.js`)**
    - [ ] Define the initial state object as specified in `docs/design.md`.
    - [ ] Create a class or object to manage state, including methods to get and set properties.
    - [ ] **COMMIT:** `feat(state): implement core application state management`

- [ ] **Task 3: Basic UI Rendering (`UI.js`)**
    - [ ] Implement a function to render the main grid based on `AppState`.
    - [ ] Implement a function to render global controls (tempo, play/stop).
    - [ ] Connect `UI.js` to `main.js` to perform initial render.
    - [ ] **COMMIT:** `feat(ui): implement basic grid and control rendering`

- [ ] **Task 4: Implement Audio Engine (`AudioEngine.js`)**
    - [ ] Initialize Web Audio API `AudioContext`.
    - [ ] Implement a placeholder function for loading samples.
    - [ ] Implement basic playback scheduling logic (the core timer).
    - [ ] **COMMIT:** `feat(audio): set up audio engine with Web Audio API`

## Phase 2: Core Feature Implementation

- [ ] **Task 5: Implement Clip Playback & Quantization**
    - [ ] Implement sample loading from a predefined list.
    - [ ] Connect user click on a clip to the `AudioEngine`.
    - [ ] Implement the quantization logic to schedule playback on the correct beat.
    - [ ] Add visual feedback for `playing`, `pending`, and `stopped` states in `UI.js`.
    - [ ] **COMMIT:** `feat(core): implement quantized clip playback and visual feedback`

- [ ] **Task 6: Implement Global Controls**
    - [ ] Implement scene (row) playback.
    - [ ] Implement the global stop button.
    - [ ] Implement tempo change functionality.
    - [ ] **COMMIT:** `feat(controls): implement scene playback, global stop, and tempo control`

- [ ] **Task 7: Implement Track & Clip Controls**
    - [ ] Implement track volume sliders.
    - [ ] Implement per-clip pitch sliders.
    - [ ] Connect sliders to the `AudioEngine` to modify audio parameters.
    - [ ] **COMMIT:** `feat(controls): implement track volume and clip pitch controls`

## Phase 3: Advanced Features & Finalization

- [ ] **Task 8: Implement Sample Loading**
    - [ ] Implement UI for choosing between preset samples and file upload.
    - [ ] Implement user file upload functionality for `.wav` files.
    - [ ] **COMMIT:** `feat(feature): enable user sample loading via file upload`

- [ ] **Task 9: Implement View Mode Switching**
    - [ ] Add the UI switch for 'Edit' and 'Presentation' modes.
    - [ ] Implement logic in `UI.js` to show/hide controls based on the `viewMode` in `AppState`.
    - [ ] **COMMIT:** `feat(feature): implement view mode switching`

- [ ] **Task 10: Implement Save/Load Functionality**
    - [ ] Implement the 'Save' feature to download the state as a `.json` file.
    - [ ] Implement the 'Load' feature to read a `.json` file and restore the application state.
    - [ ] **COMMIT:** `feat(feature): implement save and load project state`

- [ ] **Task 11: Grid Size Customization**
    - [ ] Add UI controls for changing grid rows and columns.
    - [ ] Ensure `AppState` and `UI` dynamically adapt to the new grid size.
    - [ ] **COMMIT:** `feat(feature): allow user to customize grid size`

- [ ] **Task 12: Final Review and Refinement**
    - [ ] Review all code for adherence to `global_rules.md`.
    - [ ] Test all functionality thoroughly.
    - [ ] Add comments where necessary [SD].
    - [ ] **COMMIT:** `chore(project): final review and code refinement`
