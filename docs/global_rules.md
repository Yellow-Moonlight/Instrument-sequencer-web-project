# 1. 구현 작업 원칙

- 비즈니스 로직 구현 작업은 반드시 테스트를 먼저 작성하고 구현하세요.
- SOLID 원칙을 사용해서 구현하세요.
- Clean Architecture를 사용해서 구현하세요
- Pulumi나 CloudFormation에 설정하는 Description은 영문으로 작성하세요.

# 2. 코드 품질 원칙

- 단순성 : 언제나 복잡한 솔루션보다 가장 단순한 솔류션을 우선시하세요.
- 중복 방지 : 코드 중복을 피하고, 가능한 기존 기능을 재사용하세요(DRY원칙)
- 가드레일 : 테스트 외에는 개발이나 프로덕션 환경에서 모의 데이터를 사용하지 마세요.
- 효율성 : 명확성을 희생하지 않으면서 토큰 사용을 최소화하도록 출력을 최적화하세요.

# 3. 리팩토링

- 리팩토링이 필요한 경우 계획을 설명하고 허락을 받은 다음 진행하세요.
- 코드 구조를 개선하는 것이 목표이며, 기능 변경은 아닙니다.
- 리팩토링 후에는 모든 테스트가 통과하는지 확인하세요.

# 4. 디버깅

- 디버깅 시에는 원인 및 해결책을 설명하고 허락을 받은 다음 진행하세요.
- 에러 해결이 중요한 것이 아니라 제대로 동작하는 것이 중요합니다.
- 원인이 불분명할 경우 분석을 위해 상세 로그를 추가하세요.

# 5 언어.

- AWS 리소스에 대한 설명은 영문으로 작성하세요.
- 기술적인 용어나 라이브러리 이름 등은 원문을 유지합니다.
- 간단한 다이어그림은 mermaid를 사용하고, 복잡한 아키텍처 다이어그램은 별도의 svg파일을 생성하고 그걸 문서에 포함시킬 것.

* **Simplicity First (SF):** Always choose the simplest viable solution. Complex patterns or architectures require explicit justification.
* **Readability Priority (RP):** Code must be immediately understandable by both humans and AI during future modifications.
* **Dependency Minimalism (DM):** No new libraries or frameworks without explicit request or compelling justification.
* **Industry Standards Adherence (ISA):** Follow established conventions for the relevant language and tech stack.
* **Strategic Documentation (SD):** Comment only complex logic or critical functions. Avoid documenting the obvious.
Write new docs in english. If you find docs in other languages, rewrite them into english.
* **Test-Driven Thinking (TDT):** Design all code to be easily testable from inception.

## Workflow Standards

* **Atomic Changes (AC):** Make small, self-contained modifications to improve traceability and rollback capability.
* **Commit Discipline (CD):** Recommend regular commits with semantic messages using conventional commit format:
  ```
  type(scope): concise description
  
  [optional body with details]
  
  [optional footer with breaking changes/issue references]
  ```
  Types: feat, fix, docs, style, refactor, perf, test, chore
* **Transparent Reasoning (TR):** When generating code, explicitly reference which global rules influenced decisions.
* **Context Window Management (CWM):** Be mindful of AI context limitations. Suggest new sessions when necessary.
* **Preserve Existing Code (PEC):** Windsurf must not overwrite or break functional code unless explicitly instructed otherwise. Propose changes conservatively to maintain codebase integrity [AC, CA]

## Code Quality Guarantees

* **DRY Principle (DRY):** No duplicate code. Reuse or extend existing functionality.
* **Clean Architecture (CA):** Generate cleanly formatted, logically structured code with consistent patterns.
* **Robust Error Handling (REH):** Integrate appropriate error handling for all edge cases and external interactions.
* **Code Smell Detection (CSD):** Proactively identify and suggest refactoring for:
  * Functions exceeding 30 lines
  * Files exceeding 300 lines
  * Nested conditionals beyond 2 levels
  * Classes with more than 5 public methods

## Security & Performance Considerations

* **Input Validation (IV):** All external data must be validated before processing.
* **Resource Management (RM):** Close connections and free resources appropriately.
* **Constants Over Magic Values (CMV):** No magic strings or numbers. Use named constants.
* **Security-First Thinking (SFT):** Implement proper authentication, authorization, and data protection.
* **Performance Awareness (PA):** Consider computational complexity and resource usage.

## AI Communication Guidelines

* **Rule Application Tracking (RAT):** When applying rules, tag with the abbreviation in brackets (e.g., [SF], [DRY]).
* **Explanation Depth Control (EDC):** Scale explanation detail based on complexity, from brief to comprehensive.
* **Alternative Suggestions (AS):** When relevant, offer alternative approaches with pros/cons.
* **Knowledge Boundary Transparency (KBT):** Clearly communicate when a request exceeds AI capabilities or project context.

## Continous documentation during development process (CDiP)

* **Keep all  *.md files up-to-date, which where used to keep track of progress, todos and help ing infos** (e.g. TASK_LIST.md, README.md, LEARNING_FROM_JAVA.md, VAU_IMPLEMENTATION_PLAN.md, etc.)
- generate memories for each new created or new requested md file, which shall help the AI or the developer to keep track of the project context and progress.
- update the md files, when new tasks are added, completed or when new todos are added or completed.
- but do not touch *.md files in doc folder!  

## Feature-Based Development Workflow

1. **Create Feature Branch:**
   - For each new feature or task, create a dedicated feature branch from master.
   - Use descriptive branch names with conventional format: `feature/feature-name` or `task/task-name` [CD].

2. **Development Process:**
   - Complete all development work in the feature branch [AC].
   - Ensure all tests pass successfully before considering the task complete [CTC].
   - Follow clean architecture principles and coding standards [CA].

3. **Task Completion in Feature Branch:**
   - Mark tasks as completed in `TASK_LIST.md` within the feature branch [CDiP].
   - Commit these changes to the feature branch [CD].
   - This should be done before creating the pull request.

4. **Pull Request Process:**
   - Create a pull request to the master branch when feature is complete [AC].
   - Include the updated `TASK_LIST.md` in the pull request [CDiP].
   - Wait for reviewer acknowledgment before proceeding.

5. **Merge Process:**
   - After approval, merge the feature branch into master.
   - Delete the feature branch after successful merge [AC].

6. **Task Tracking:**
   - The updated `TASK_LIST.md` is already part of the merged changes [CDiP].
   - No additional updates to `TASK_LIST.md` should be needed after the PR is approved.

**This workflow ensures that:**
   - Each feature can be rolled back independently if needed [AC].
   - Code quality is maintained through the review process [CA].
   - The master branch always contains a working version of the application [PEC].
   - Progress is clearly tracked and documented [CDiP].
   - Task completion is part of the feature work and included in the review process [CD].