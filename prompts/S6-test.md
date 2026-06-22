# STEP 6 — 테스트 (S3)

> S3 테스트. pipeline §5 의도 선언 후 진행. 기능정의서 §6 비기능 + context §7.

## 지시 요약
- 단위: 따르기 수위 계산, 헛누름 8% 분기, 누적/환산, 설정 저장·복원.
- 통합/흐름: S-02→S-03→S-04→마시기→순환→S-08.
- 실행해 통과/실패 정리.
- 성능(F-SY-07/08)·SDK·센서·무음·백그라운드는 코드 확인 불가 → REVIEW/UNVERIFIED "실기기 측정 필요".
- 반복 전환 누수 없는지 안정성 확인.

## 결정
- 컴포넌트 내 순수 계산을 src/lib/pour.js·health.js로 추출 → 실제 코드 단위 테스트(중복 아님).
- Vitest + jsdom + RTL. performance.now/rAF 스텁으로 결정론화.
- drinkTap 부수효과를 updater 밖으로(StrictMode 이중호출 누적 중복 방지) — 테스트 중 발견·수정.

## 결과
- 5 files / 24 tests 전부 통과.
  - pour.test.js: computeFill·isHollow(8%)·decrementDrink.
  - health.test.js: 환산(24잔→₩28,800/3,360kcal 정합).
  - storage.test.js: 저장/부분병합/재진입 복원.
  - PourInteraction.test.jsx: 헛누름 분기, 정상 따르기, 4탭 비움+누적, 10회 반복 안정성, 언마운트 정리.
  - flow.test.jsx: 전체 흐름 → 기록 환산 반영.
- `npm run build` 성공(64 modules).

## 코드로 확인 불가(실기기 측정 필요) — 마커
- 성능 로딩10초/반응2초(F-SY-07/08): REVIEW, 대상 환경 측정.
- SDK(share/getTossShareLink/haptic), 센서(devicemotion/orientation), 무음(F-SY-03), 백그라운드·복귀 BGM(F-SY-04): UNVERIFIED/REVIEW.
