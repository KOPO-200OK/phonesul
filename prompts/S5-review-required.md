# STEP 5 — 검수 필수 기능 (F-SY 전부)

> S2 구현(검수필수, 반려 직결). pipeline §5 의도 선언 후 진행.

## 지시 요약
- S-09 설정: 사운드 On/Off(F-SY-01)·진동 On/Off(F-SY-02). mock storage 저장, 재진입 유지. 진동 꺼도 시각·청각 유지.
- 무음 모드 존중(F-SY-03)·백그라운드 사운드 제어(F-SY-04, visibilitychange): 인터페이스+mock. 복귀 BGM → REVIEW(복귀 BGM 동작) + 실기기 확인 명시.
- 종료 확인 모달(F-SY-05)·닫기 버튼(F-SY-06, 우상단 X, 모든 주요 화면).
- onAudioFocusChanged(RN 전용) 금지.

## 결정·가정
- F-SY-01/02는 STEP4 스토어+mock storage로 이미 영속화 → 재진입 유지 확인, 문구 보강.
- F-SY-03/04는 사용자 설정 아닌 시스템 자동 동작 → src/lib/audioPolicy.js로 분리, App 마운트 시 visibilitychange 1회 설치.
- RN onAudioFocusChanged 미사용. 웹 표준 visibilitychange만(코드 내 유일 등장은 '사용 금지' 주석).
- 가정값 없음(모두 인터페이스/정책).

## 산출물
- 신규: src/lib/audioPolicy.js (무음/백그라운드 mock 정책)
- 패치: App.jsx(정책 설치 useEffect), Settings.jsx(마커·문구 보강)
- 기존: ExitModal.jsx(F-SY-05), AppHeader.jsx 닫기 X(F-SY-06) — 모든 주요 화면 커버(Splash 제외=로딩 전용)

## 검증
- `npm run build` 성공(64 modules, 에러 0). dev 변환 200, 에러 0.
- onAudioFocusChanged 코드 사용 0(주석만). 
- 수동 확인 필요: 토글 새로고침 유지, 탭 전환(visibilitychange) 콘솔 로그, 종료 모달, 각 화면 X.
