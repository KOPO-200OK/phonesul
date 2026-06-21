# CLAUDE.md — 건강폰술 AI 개발 파이프라인

> Claude Code가 매 세션 처음 읽는 진입점. 규칙은 아래 3파일에 있고 @import로 불러온다.

@CLAUDE.pipeline.md
@CLAUDE.platform.md
@CLAUDE.context.md

## 파일 역할

| 파일 | 역할 | 교체 시점 |
|---|---|---|
| ① pipeline | 단계·게이트·검수 규칙 | 앱·플랫폼 바뀌어도 유지 |
| ② platform | 앱인토스 정책·심사 제약 | 플랫폼 바뀌면 교체 |
| ③ context | 건강폰술 기능·기술 결정 | 아이디어 바뀌면 새로 씀 |

## 우선 원칙

- What 고정(이 문서들) / How 위임(Claude Code·MCP).
- SDK 사용법은 문서에 없음 → 앱인토스 MCP(ax)·스킬.
- 충돌 시: 플랫폼 정책(②) > 앱 결정(③). 방법론(①)은 별도 층.
- AI 실수는 팀 책임 → 검수 마커(UNVERIFIED/ASSUMPTION/REVIEW)로 사람이 볼 지점 표시.
- 콘셉트: 마시는 앱이 아니라 "안 마시는 사람을 위한 앱". 음주 미화·권장 금지.
