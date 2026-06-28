# STEP 2 — 프로젝트 골격 생성

> S2 구현(골격). pipeline §5 의도 선언 후 진행. SDK 호출 코드 없음.

## 지시 요약
- React 18 + Vite, CSR 기준 빈 프로젝트 골격(context §4).
- 앱인토스 프로젝트 생성·SDK·빌드 방식은 adapter별 tool config와 MCP(ax)에서 확인해 반영. 이 단계는 폴더·라우팅·상태관리 골격만.
- 화면설계서 S-01~S-10을 라우트/컴포넌트 빈 껍데기로.
- /prompts 폴더 포함(pipeline §6.1).
- 로컬 `npm run dev` 기동 확인.

## 결정·가정
- MCP(ax) 미연결 → 앱인토스 스캐폴드/SDK/빌드 규칙 `// UNVERIFIED:`. 순정 Vite 골격을 호환 구조로 생성.
- appName 변경 불가·미확정 → 실명 스캐폴딩 보류(`// REVIEW:`). npm name은 임시(`ponsul-webapp`).
- 라우팅: HashRouter(딥링크/새로고침 안전 기본값) — 앱인토스 URL 규칙 확인 후 재검토.
- S-04는 단일 라우트(`/pour`), 내부 3상태 순환. S-10은 라우트 아닌 공통 오버레이.

## 산출물
- package.json / vite.config.js / index.html
- src/main.jsx, App.jsx
- src/store/useAppStore.js (zustand 상태 모양만)
- src/screens/*.jsx (S-01~S-09)
- src/components/AppHeader.jsx, ExitModal.jsx(S-10), exitModalContext.js
- src/styles/global.css
