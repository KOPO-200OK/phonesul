# STEP 4 — 술 선택 + 모드 + 기록 (확장)

> S2 구현(확장). pipeline §5 의도 선언 후 진행.

## 지시 요약
- S-03 술 선택: 5종 카드, 종류별 색·점도 프리셋만 차등(F-CR-01). 브랜드 실명·로고 금지. 샴페인 '축하 연출' 배지.
- S-02 모드: 혼술/술자리(F-MD-01~03). 연출 속도·톤 프리셋. 마지막 모드 저장(mock storage).
- S-08 건강 기록: 누적 +1, 아낀 값 환산(F-HL-01·02). 계수 ASSUMPTION + 출처. 목표·레벨·랭킹 없음.
- 에셋 없음 → CSS/도형 플레이스홀더 + REVIEW(에셋 일관성).

## 결정·가정
- 술/모드/환산을 src/data/presets.js 단일 출처로 통합(S-02·03·04·08 공유).
- mock storage(src/lib/storage.js, localStorage 폴백) — 실 앱인토스 Storage는 UNVERIFIED.
- 모드 속도 배수를 S-04 따르기 속도에 연결(혼술 1.25×/술자리 0.8×).
- ASSUMPTION: 점도(차오름 시간), 모드 배수, 환산 계수(₩1,200/잔·140kcal/잔, 출처 표기).

## 산출물
- 신규: src/data/presets.js, src/lib/storage.js
- 교체: useAppStore.js, DrinkSelect.jsx, ModeSelect.jsx, HealthRecord.jsx
- 패치: PourInteraction.jsx(프리셋·모드 속도 연결), global.css(스와치·활성카드)

## 검증
- `npm run build` 성공(63 modules, 에러 0). dev 변환 200, 에러 0.
- 수동 확인: 모드 선택→저장(새로고침 유지), 5종 카드 색/점도, 비우기 누적→기록 환산.
