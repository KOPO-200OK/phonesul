# STEP B — 에셋 코드 투입

> STEP A(에셋 배치) 후속. pipeline §5 의도 선언 후 진행.

## 결정 (사람 확인)
- S-04 따르기 비주얼: **소주=30프레임 시퀀스 / 나머지=현행 scaleY 유지**(팀 WebKit 수정 보존). [AskUserQuestion 응답]
- 정적 병/잔: 충돌 없는 자리 투입 — 병=S-04 대기/따르기, 잔=S-03 카드 썸네일. 샴페인은 CSS 폴백.
- 사운드: 소주·맥주만 실재생, 나머지 무음(시각 피드백 유지).

## 산출물
- presets.js: 종류별 bottle/glass/sound/frames 경로 + assetUrl/sojuFrameUrl (BASE_URL 상대배포 안전)
- pour.js: frameIndexFromFill(순수) + 단위테스트 4개
- feedback.js: startPourSound/stopPourSound 실제 Audio(설정 존중)
- audioPolicy.js: 백그라운드 시 따르기 사운드도 정지(F-SY-04)
- PourInteraction.jsx: 소주 프레임 + 병 이미지 + 사운드 연결
- DrinkSelect.jsx: 잔 이미지 썸네일
- Splash.jsx: 로고 이미지
- global.css: bottle-img/pour-frame/drink-thumb/logo-img
- test/setup.js: HTMLMediaElement play/pause stub

## 마커
- // UNVERIFIED: 정적 일러스트·로고 AI 고지 의무(platform §3), 로고 규격(§5.3), 사운드 자동재생·무음 실동작 — 실기기/채널톡.

## 검증
- `npm test` 28/28 통과. `npm run build` 정상.
- 수동: 소주 따르기 프레임 차오름, 병/잔/로고 표시, 소주·맥주 사운드 재생, 탭 전환 정지.
