# Stage Executor Contract

> 이 문서는 런타임 코드 인터페이스가 아니라, AI agent가 각 단계를 실행할 때 지켜야 하는 문서화된 계약이다.
> Harness Engineering은 단계·게이트·검수 마커를 고정하고, Stage Executor Contract는 그 단계를 실행하는 agent의 입출력 경계를 고정한다.
> Agent Adapter는 이 계약을 실제 도구(Claude Code, Codex 등)에 연결하는 얇은 진입점이다.

## 1. 계층

| 계층 | 역할 | 이 레포의 위치 |
|---|---|---|
| Harness Engineering | 단계, 게이트, 검수 마커, 사람 책임 지점을 고정 | `shared/pipeline.md` |
| Stage Executor Contract | 단계 실행 agent의 공통 입출력 경계 | 이 문서 |
| Agent Adapter | 특정 AI agent/CLI에 계약을 바인딩 | `CLAUDE.md`, `AGENTS.md` |

`shared/platform.md`와 `shared/context.md`는 별도 계층이 아니라 Stage Executor Contract에 주입되는 계약 입력이다(§2).

## 2. 입력 계약

각 stage executor는 다음 입력을 받는다.

| 입력 | 설명 | 출처 |
|---|---|---|
| pipeline | 단계·게이트·검수 규칙 | `shared/pipeline.md` |
| platform | 플랫폼 정책·심사 제약 | `shared/platform.md` |
| context | 앱별 기능·기술 결정 | `shared/context.md` |
| stage prompt | 단계별 작업 지시와 제약 | `prompts/S*.md` |
| current artifacts | 기존 코드, 문서, 테스트 결과, 배포 산출물 | repo |
| review feedback | S4 게이트의 수정요청과 사람 검수 결과 | 단계 완료 보고·회의록 |
| adapter tool config | agent별 MCP, skills, 문서 폴백, 실행 커맨드 | `CLAUDE.md`, `AGENTS.md` |

## 3. 출력 계약

각 stage executor는 단계별 산출물을 고정 형식으로 남긴다. `code diff`는 S2의 한 출력일 뿐이며, 모든 단계 출력은 stage artifact로 일반화한다.

| 출력 | 설명 |
|---|---|
| stage artifact | 단계 산출물. 예: S1 문서, S2 코드 diff, S3 테스트 결과, S5 배포본·제출 산출물 |
| verification result | 자동 테스트, 수동 검증, 플랫폼 의존 기능 확인 결과 |
| review markers | `UNVERIFIED` / `ASSUMPTION` / `REVIEW` 집계 |
| stage report | 한 일 요약, 미충족 항목, 사람이 판단할 부분, AI 생성 흔적·UX 자연성 위험 |

## 4. Agent Adapter 표

| adapter | 호출 방식 | 스펙 로딩 | MCP(ax) | Skills/문서 폴백 | 인간개입(B) 적합 |
|---|---|---|---|---|---|
| Claude Code (기본) | `claude` CLI | `CLAUDE.md` + `@shared/*` | MCP 표준 기반. 현재 adapter setup에 ax 연결 커맨드 기록 | 네이티브 skills 사용 | 높음. 실제 실행·검증됨 |
| OpenAI Codex (`AGENTS.md` 스텁) | `codex` 계열 CLI | `AGENTS.md`가 shared 파일 경로를 명시. 실제 로딩 방식은 제품별 재확인 | MCP 표준 기반. 전환 시 제품·버전별 지원 방식 재확인 | 공식 문서·MCP·프로젝트 문서 폴백 | 높음 예상. 미실행, 전환 가능성 증명용 |
| Gemini CLI | `gemini` 계열 CLI | 전환 시 진입점 작성 | MCP 표준 기반. 전환 시 제품·버전별 지원 방식 재확인 | 공식 문서·MCP·프로젝트 문서 폴백 | 높음 예상. 후보 |
| Cursor | IDE 세션 | `.cursor/rules` 등 전환 시 작성 | MCP 표준 기반. 전환 시 제품·버전별 지원 방식 재확인 | rules/문서 폴백 | 낮음. IDE 임베디드라 사람 개입 전제 |

> MCP는 특정 LLM 모델이 아니라 표준 기반 도구 연결 방식이므로 portability의 근거가 될 수 있다. 단, 특정 CLI가 ax MCP를 안정적으로 붙이는지는 제품·버전별로 다르므로 전환 시 재확인한다.
> `@file` import 문법은 Claude Code adapter의 로딩 방식으로만 확정한다. 다른 adapter에서는 동일 문법을 가정하지 않고, 제품별 context-loading 방식에 맞춰 `shared/` 파일을 주입한다.

## 5. 검증 매핑

| 인터페이스 요소 | 출처 |
|---|---|
| 입력: pipeline/platform/context | `shared/` 3파일 |
| 입력: stage prompt | `prompts/S*.md` |
| 입력: review feedback | `shared/pipeline.md` Human Review Gate 수정요청 |
| 출력: review markers | `shared/pipeline.md` 검수 마커 |
| 출력: stage report | `shared/pipeline.md` 단계 완료 보고 |

## 6. 검증 상태

- Claude Code adapter: 실제 구현·테스트 루프에서 사용됨.
- OpenAI Codex adapter: `AGENTS.md`로 shared 계약을 읽도록 구성한 전환 가능성 증명용 스텁. 아직 실제 실행·검증하지 않음. `// UNVERIFIED:`
- Gemini CLI/Cursor: 후보로만 기록. 실제 adapter 파일은 전환 시점에 제품 문서 확인 후 작성.
