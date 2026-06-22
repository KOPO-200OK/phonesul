// 술 종류 / 모드 / 건강 환산 — 단일 출처. S-02·S-03·S-04·S-08이 공유한다.
//
// 브랜드 실명·로고 금지: 가상 일반명칭만 사용(F-CR-01 / context §5, §6장 제외기능).
// 에셋 없음: 색·도형은 CSS 플레이스홀더(방향성 표현). 최종 비주얼은 디자인 단계 확정.
// // REVIEW(에셋 일관성): 5종 스타일·색 일관성은 일러스트 적용 단계에서 사람 검수(context §9·§10).

// 종류별 색·점도(차오름 속도) 차등 — F-CR-01.
// pourFullMs = 0→100% 도달 시간(ms). 점도가 걸쭉할수록 느리게.
// // ASSUMPTION: pourFullMs·viscosity 등급은 문서에 없는 임의값. 검수·튜닝 단계 조정.
export const DRINKS = [
  { key: 'soju', label: '소주', colors: ['#EFE9DA', '#D9D0BC'], pourFullMs: 2000, viscosity: '묽음', foam: false, celebrate: false },
  { key: 'beer', label: '맥주', colors: ['#E8B96A', '#C8893F'], pourFullMs: 2200, viscosity: '보통', foam: true, celebrate: false },
  { key: 'wine', label: '와인', colors: ['#9b3050', '#6e1f3a'], pourFullMs: 2600, viscosity: '중간', foam: false, celebrate: false },
  { key: 'makgeolli', label: '막걸리', colors: ['#F4EFE6', '#E3DCCB'], pourFullMs: 2800, viscosity: '걸쭉', foam: false, celebrate: false },
  { key: 'champagne', label: '샴페인', colors: ['#F2D89A', '#D9B65E'], pourFullMs: 2400, viscosity: '발포', foam: false, celebrate: true },
]
export const DRINK_MAP = Object.fromEntries(DRINKS.map((d) => [d.key, d]))

// 모드 프리셋 — F-MD-02(혼술)·F-MD-03(술자리). 연출 속도 배수·톤.
// speed = 따르기 시간 배수(>1 느림 / <1 빠름).
// // ASSUMPTION: 속도 배수·톤 라벨은 임의값. 분위기 연출에 한정(폭음·원샷 강요 톤 금지).
export const MODES = [
  { key: 'solo', label: '혼술 모드', cap: '잔잔한 BGM · 천천히 음미', speed: 1.25, tone: 'calm' },
  { key: 'party', label: '술자리 모드', cap: '활기찬 분위기', speed: 0.8, tone: 'lively' },
]
export const MODE_MAP = Object.fromEntries(MODES.map((m) => [m.key, m]))

// 건강 기록 환산 계수 — F-HL-02. 잔당 고정값(단순 곱).
// // ASSUMPTION: 출처 미확정 임의 대표값. 검수 단계에서 실제 기준으로 확정해야 함.
//   - SAVED_WON_PER_GLASS  : 표준 한 잔 평균 가격 가정 (₩1,200/잔)
//   - SAVED_KCAL_PER_GLASS : 알코올 음료 한 잔 대략 칼로리의 대표값 (140 kcal/잔)
//   과장·의학적 효능 주장 금지(F-HL-02): '안 마셔서 들지 않은' 단순 환산으로만 표시.
export const SAVED_WON_PER_GLASS = 1200
export const SAVED_KCAL_PER_GLASS = 140
