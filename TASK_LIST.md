# 악기 시퀀서 작업 체크리스트

이 체크리스트는 최종 설계(design.md v2)에 따라 프로젝트 개발을 단계별로 나눕니다. 각 단계는 논리적인 커밋 지점을 포함합니다.

## 1단계: 기본 구조 및 UI 렌더링

- [x] **Task 1: 프로젝트 구조 초기화**
    - [x] 기본 폴더(`css`, `js`) 및 파일 생성.
    - [x] `index.html`에 기본 레이아웃 구조 정의.

- [x] **Task 2: 핵심 상태 관리 구현 (`AppState.js`)**
    - [x] 최종 설계에 따른 초기 상태 객체 정의.
    - [x] 상태 관리를 위한 `AppState` 클래스 구현.

- [x] **Task 3: 기본 UI 렌더링 (`UI.js`, `css/style.css`)**
    - [x] `AppState`을 기반으로 빈 8x8 그리드를 렌더링하는 기능 구현.
    - [x] 4:3 비율 및 전체 레이아웃을 위한 핵심 CSS 스타일 적용.
    - [x] **COMMIT:** `feat(core): initialize project structure and basic layout`

## 2단계: 핵심 기능 구현

- [x] **Task 4: 오디오 엔진 및 샘플 로딩 구현**
    - [x] `AudioEngine.js`에 Web Audio API 초기화 및 샘플 로딩(`loadSampleFromFile`) 기능 구현.
    - [x] `main.js`에서 빈 셀 클릭 시 파일 업로드 창을 여는 이벤트 리스너 설정.
    - [x] 파일이 선택되면 `AudioEngine`을 통해 오디오를 로드하고, `AppState`을 업데이트한 뒤, `UI`를 다시 렌더링하여 셀에 파일명 표시.
    - [x] **COMMIT:** `feat(core): implement sample loading and display filename`

- [ ] **Task 5: 클립 재생 및 퀀타이즈 구현**
    - [ ] `AudioEngine.js`에 메인 스케줄러 및 1마디 퀀타이즈 로직 구현.
    - [ ] `main.js`에서 샘플이 있는 셀 클릭 시, 상태를 `pending`으로 변경.
    - [ ] 스케줄러가 `pending` 상태의 클립을 찾아 다음 마디에 맞춰 재생하고, 상태를 `playing`으로 변경.
    - [ ] `UI.js`에 `stopped`, `pending`, `playing` 상태에 따른 시각적 피드백(색상 변경 등) 추가.
    - [ ] **COMMIT:** `feat(playback): implement quantized clip playback`

## 3단계: 고급 기능 및 컨트롤 구현

- [ ] **Task 6: 루프, 자동 속도 조절, 정지 기능 구현**
    - [ ] `AudioEngine.js`에서 재생되는 모든 소스를 추적하는 기능 구현.
    - [ ] 재생 시 `loop` 속성을 true로 설정하고, 샘플 길이에 맞춰 `playbackRate`을 자동 계산하여 적용.
    - [ ] 재생 중인 클립을 다시 클릭하거나, `Stop All` 버튼 클릭 시 소리를 멈추는 `stopClip` 기능 구현.
    - [ ] **COMMIT:** `feat(audio): implement looping, timestretch, and stop functionality`

- [x] **Task 7: 볼륨 조절 및 재생 진행률 시각화**
    - [x] `UI.js`에 그리드별 볼륨 슬라이더와 재생 진행률 바(progress bar) DOM 생성 로직 추가.
    - [x] `AudioEngine.js`에서 재생 시 볼륨을 적용하고, `requestAnimationFrame`으로 재생 진행률을 지속적으로 계산하여 콜백으로 전달.
    - [x] `main.js`에서 볼륨 슬라이더 값 변경을 `AppState`에 반영하고, 진행률 콜백을 받아 `UI`에 업데이트 요청.
    - [x] **COMMIT:** `feat(controls): implement volume control and progress bar`

- [ ] **Task 8: 샘플 교체 모드 구현**
    - [ ] `AppState.js`에 `isReplaceMode` 상태 추가.
    - [ ] `UI.js`에 'Replace Sample' 버튼 및 관련 활성화 스타일 추가.
    - [ ] `main.js`에서 교체 모드 로직 구현: 모드 활성화 시, 샘플이 있는 셀을 클릭하면 파일 업로드 창 열기.
    - [ ] **COMMIT:** `feat(feature): implement sample replacement mode`

## 4단계: 최종 마무리

- [ ] **Task 9: 프레젠테이션 모드 구현**
    - [ ] `AppState.js`에 `viewMode` (e.g., 'edit', 'presentation') 상태 추가.
    - [ ] `UI.js`에 'Presentation View' 전환 버튼 및 관련 UI 로직 추가.
    - [ ] `css/style.css`에 프레젠테이션 모드일 때 컨트롤을 숨기는 스타일 추가.
    - [ ] `main.js`에서 뷰 모드 전환 로직 구현.
    - [ ] **COMMIT:** `feat(feature): implement presentation view mode`

- [ ] **Task 10: 사용자 프리셋 저장/로드 구현**
    - [ ] `main.js`에 `AppState`를 `.json` 파일로 저장하고, 불러오는 기능 구현.
    - [ ] `UI.js`에 관련 버튼 추가.
    - [ ] **COMMIT:** `feat(feature): implement user preset save/load`

- [ ] **Task 10: 최종 코드 검토 및 정리**
    - [ ] 모든 코드의 일관성 및 가독성 검토.
    *   필요한 주석 추가 및 최종 테스트.
    - [ ] **COMMIT:** `chore(project): final review and cleanup`