# AGENTS.md — OpenAI Codex adapter 스텁

> OpenAI Codex 계열 agent 전환 가능성을 보이기 위한 adapter 스텁이다.
> 실제 파이프라인 계약은 `shared/` 3파일에 있고, 이 파일은 그 계약을 Codex 계열 agent에 바인딩하는 구조를 보여준다.
> 현재 이 adapter는 전환 가능성 증명용 구성이다. 실제 실행·검증된 adapter는 `CLAUDE.md`의 Claude Code adapter다.

## Contract inputs

대상 agent는 전환 시점의 제품별 context-loading 방식에 맞춰 아래 파일을 읽어야 한다.

- `shared/pipeline.md`
- `shared/platform.md`
- `shared/context.md`

> `@file` import 문법은 Claude Code adapter에서 검증된 방식이다. non-Claude CLI agent에서는 같은 문법을 가정하지 않고, 각 제품의 문서 기준으로 파일 주입 방식을 재확인한다. `// UNVERIFIED:`

## 파일 역할

| 파일 | 역할 | 교체 시점 |
|---|---|---|
| ① pipeline | 단계·게이트·검수 규칙 | 앱·플랫폼 바뀌어도 유지 |
| ② platform | 앱인토스 정책·심사 제약 | 플랫폼 바뀌면 교체 |
| ③ context | 건강폰술 기능·기술 결정 | 아이디어 바뀌면 새로 씀 |

## Codex adapter setup

- MCP(ax): MCP 표준 기반 도구 연결을 전제로 하되, 전환 시점에 Codex 제품·버전별 지원 방식 재확인. `// UNVERIFIED:`
- Skills: Claude Code 전용 skills는 직접 이식하지 않고, 공식 문서·MCP·프로젝트 문서 폴백으로 대체.
- 프로젝트 생성 시 agent 선택값은 전환 시점의 앱인토스·Codex 지원 문서로 재확인. `// UNVERIFIED:`

> 이 파일은 "같은 shared 계약을 다른 agent가 읽을 수 있다"는 구조 증명용이다. 실제 앱 구현·테스트는 아직 Claude Code adapter에서 수행했다.

## 우선 원칙

- What 고정(`shared/` 계약) / How 위임(Codex adapter·MCP/문서 폴백).
- SDK 사용법은 shared 정책 문서에 없음 → adapter별 tool config와 앱인토스 MCP(ax)·공식 문서에 위임.
- 충돌 시: 플랫폼 정책(②) > 앱 결정(③). 방법론(①)은 별도 층.
- AI 실수는 팀 책임 → 검수 마커(UNVERIFIED/ASSUMPTION/REVIEW)로 사람이 볼 지점 표시.
- 콘셉트: 마시는 앱이 아니라 "안 마시는 사람을 위한 앱". 음주 미화·권장 금지.
