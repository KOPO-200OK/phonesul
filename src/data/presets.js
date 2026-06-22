// 술 종류 / 모드 / 에셋 경로 — 단일 출처. S-02·S-03·S-04가 공유한다.
// (v0.2: 기록 기능 F-HL 제거 — 환산 계수 없음)
//
// 브랜드 실명·로고 금지: 가상 일반명칭만 사용(F-CR-01 / context §5, §6장 제외기능).
// 에셋 없음: 색·도형은 CSS 플레이스홀더(방향성 표현). 최종 비주얼은 디자인 단계 확정.
// // REVIEW(에셋 일관성): 5종 스타일·색 일관성은 일러스트 적용 단계에서 사람 검수(context §9·§10).

// 정적 에셋 경로 헬퍼 — public/assets 기준. base './' 상대배포에서도 안전하게 BASE_URL 접두.
export const assetUrl = (p) => `${import.meta.env.BASE_URL}assets/${p}`

// // UNVERIFIED: 정적 일러스트·로고가 생성형 AI 산출물이면 platform §3 고지·표시 의무 대상(context §10).
//   AI 생성 여부·고지 범위는 채널톡 문의로 확정 필요. 로고는 §5.3 규격(600×600 등)도 별도 확인.

// 종류별 색·점도(차오름 속도) 차등 — F-CR-01.
// pourFullMs = 0→100% 도달 시간(ms). 점도가 걸쭉할수록 느리게.
// bottle = S-03 술 선택 썸네일 + S-04 대기/따르기 병. glass = S-04 잔(채움 잔). glassFilled = 가득 찬 잔(보조).
// sound = 따르기 사운드(없으면 무음/콘솔 mock). frames = 따르기 프레임 수(소주만 30, 나머지 0 → scaleY 액체).
// // ASSUMPTION: pourFullMs·viscosity 등급은 문서에 없는 임의값. 검수·튜닝 단계 조정.
export const DRINKS = [
  { key: 'soju', label: '소주', colors: ['#EFE9DA', '#D9D0BC'], pourFullMs: 2000, viscosity: '묽음', foam: false, celebrate: false,
    bottle: assetUrl('bottles/soju.png'), glass: assetUrl('glasses/soju.png'), glassFilled: assetUrl('glasses_filled/soju.png'), sound: assetUrl('sounds/pour/soju.mp3'), frames: 30 },
  { key: 'beer', label: '맥주', colors: ['#E8B96A', '#C8893F'], pourFullMs: 2200, viscosity: '보통', foam: true, celebrate: false,
    bottle: assetUrl('bottles/beer.png'), glass: assetUrl('glasses/beer.png'), glassFilled: assetUrl('glasses_filled/beer.png'), sound: assetUrl('sounds/pour/beer.mp3'), frames: 0 },
  { key: 'wine', label: '와인', colors: ['#9b3050', '#6e1f3a'], pourFullMs: 2600, viscosity: '중간', foam: false, celebrate: false,
    bottle: assetUrl('bottles/wine.png'), glass: assetUrl('glasses/wine.png'), glassFilled: assetUrl('glasses_filled/wine.png'), sound: null, frames: 0 },
  { key: 'makgeolli', label: '막걸리', colors: ['#F4EFE6', '#E3DCCB'], pourFullMs: 2800, viscosity: '걸쭉', foam: false, celebrate: false,
    bottle: assetUrl('bottles/makgeolli.png'), glass: assetUrl('glasses/makgeolli.png'), glassFilled: assetUrl('glasses_filled/makgeolli.png'), sound: null, frames: 0 },
  // 샴페인: 새 세트로 병·잔·채워진잔 확보(CSS 폴백 해제). 코르크·뚜껑열린병은 S-05용(champagne/ 배치, 미연결).
  { key: 'champagne', label: '샴페인', colors: ['#F2D89A', '#D9B65E'], pourFullMs: 2400, viscosity: '발포', foam: false, celebrate: true,
    bottle: assetUrl('bottles/champagne.png'), glass: assetUrl('glasses/champagne.png'), glassFilled: assetUrl('glasses_filled/champagne.png'), sound: null, frames: 0 },
]
export const DRINK_MAP = Object.fromEntries(DRINKS.map((d) => [d.key, d]))

// 소주 따르기 프레임 URL (1-기반, 0패딩 2자리).
export const sojuFrameUrl = (n) => assetUrl(`pour/soju/frame_${String(n).padStart(2, '0')}.png`)

// 모드 프리셋 — F-MD-02(혼술)·F-MD-03(술자리). 연출 속도 배수·톤.
// speed = 따르기 시간 배수(>1 느림 / <1 빠름).
// // ASSUMPTION: 속도 배수·톤 라벨은 임의값. 분위기 연출에 한정(폭음·원샷 강요 톤 금지).
export const MODES = [
  { key: 'solo', label: '혼술 모드', cap: '잔잔한 BGM · 천천히 음미', speed: 1.25, tone: 'calm' },
  { key: 'party', label: '술자리 모드', cap: '활기찬 분위기', speed: 0.8, tone: 'lively' },
]
export const MODE_MAP = Object.fromEntries(MODES.map((m) => [m.key, m]))
