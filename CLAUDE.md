# CLAUDE.md — Claude Code adapter 진입점

> Claude Code가 매 세션 처음 읽는 adapter 진입점이다.
> 실제 파이프라인 계약은 `shared/` 3파일에 있고, 이 파일은 그 계약을 Claude Code에 바인딩한다.
> 현재 실제 실행·검증된 기본 adapter는 Claude Code다.

@shared/pipeline.md
@shared/platform.md
@shared/context.md

## 파일 역할

| 파일 | 역할 | 교체 시점 |
|---|---|---|
| ① pipeline | 단계·게이트·검수 규칙 | 앱·플랫폼 바뀌어도 유지 |
| ② platform | 앱인토스 정책·심사 제약 | 플랫폼 바뀌면 교체 |
| ③ context | 건강폰술 기능·기술 결정 | 아이디어 바뀌면 새로 씀 |

## Claude Code adapter setup

- MCP(ax): `claude mcp add --transport stdio apps-in-toss ax mcp start`
- Skills: `/plugin install knowledge-skills@apps-in-toss-skills`
- 프로젝트 생성 시: `npx create-ait-app {appName}` (TDS=Y, skills=Claude Code)

> 위 항목은 앱인토스 정책이 아니라 Claude Code adapter의 설치·지식 주입 방식이다. 다른 agent로 전환하면 이 setup만 해당 agent 방식으로 교체한다.

## 우선 원칙

- What 고정(`shared/` 계약) / How 위임(Claude Code adapter·MCP).
- SDK 사용법은 shared 정책 문서에 없음 → Claude Code adapter setup과 앱인토스 MCP(ax)·스킬에 위임.
- 충돌 시: 플랫폼 정책(②) > 앱 결정(③). 방법론(①)은 별도 층.
- AI 실수는 팀 책임 → 검수 마커(UNVERIFIED/ASSUMPTION/REVIEW)로 사람이 볼 지점 표시.
- 콘셉트: 마시는 앱이 아니라 "안 마시는 사람을 위한 앱". 음주 미화·권장 금지.
