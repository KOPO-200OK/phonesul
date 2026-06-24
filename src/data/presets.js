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
// bottle = S-03 술 선택 썸네일 + S-04 대기/따르기 병. glass = S-04 잔(벡터 SVG, 흡수 에셋). glassFilled = 가득 찬 잔(보조).
// sound = 따르기 사운드(없으면 무음/콘솔 mock). frames = 따르기 프레임 수(소주만 30, 나머지 0 → scaleY 액체).
// // ASSUMPTION: pourFullMs·viscosity 등급은 문서에 없는 임의값. 검수·튜닝 단계 조정.
//
// 잔별 액체 채움 기하 — 잔 SVG마다 보울(액체가 담기는 부분) 위치·비율이 달라서 필요하다.
//   glassAspect = 잔 SVG 가로/세로(viewBox 기준). 잔을 이 비율로 렌더해 레터박싱 없이 채움 좌표를 맞춘다.
//   bowl = 보울 영역(잔 박스 대비 %). 액체는 이 영역 안에서 아래→위로 차오른다.
//          { top, bottom, left, right }. 다리 달린 잔(와인·샴페인)은 보울이 위쪽에만, 막걸리는 위 여백이 큼.
//          clip = (선택) 보울 외곽 폴리곤(보울 영역 대비 %). 테이퍼 잔은 이걸로 액체를 잔 모양에 맞춤
//                 (없으면 사각형 — 직벽 잔 소주·맥주). 좌표는 각 SVG 보울 외곽선에서 도출.
// // ASSUMPTION: bowl·clip·glassAspect 값은 각 SVG viewBox/패스에서 도출한 근사값 — 화면에서 미세 튜닝 필요(// REVIEW(기기 확인)).
//   소주 35×38 / 맥주 73×89(손잡이 제외) / 와인 48×73 / 막걸리 71×54 / 샴페인 28×96.
export const DRINKS = [
  { key: 'soju', label: '소주', colors: ['#EFE9DA', '#D9D0BC'], pourFullMs: 2000, viscosity: '묽음', foam: false, celebrate: false,
  bottle: assetUrl('bottles/soju.png'), bottleOpen: assetUrl('bottles/soju_open.png'), glass: assetUrl('glasses/soju.svg'), glassFilled: assetUrl('glasses_filled/soju.png'), sound: assetUrl('sounds/pour/soju.mp3'), frames: 30,
  glassAspect: 35 / 38,
  bowl: {
    top: 7,
    bottom: 91,
    left: 9,
    right: 93
  },
  liquidShape: {
    viewBox: '0 0 30 32',
    path: 'M0.179688 2.56562C1.17969 -0.934381 28.6797 -0.934377 29.6797 3.06561C30.4169 6.01439 28.4368 19.8324 27.3451 26.8915C26.9716 29.307 24.8882 31.0656 22.444 31.0656H7.02845C4.53487 31.0656 2.42486 29.2368 2.10414 26.764C1.1562 19.455 -0.558661 5.14984 0.179688 2.56562Z'
  } },
  { key: 'beer', label: '맥주', colors: ['#E8B96A', '#C8893F'], pourFullMs: 2200, viscosity: '보통', foam: true, celebrate: false,
    bottle: assetUrl('bottles/beer.png'), bottleOpen: assetUrl('bottles/beer_open.png'), glass: assetUrl('glasses/beer.svg'), glassFilled: assetUrl('glasses_filled/beer.png'), sound: assetUrl('sounds/pour/beer.mp3'), frames: 0,
    glassAspect: 73 / 89, bowl: { top: 7, bottom: 96, left: 5, right: 68 } },
  { key: 'wine', label: '와인', colors: ['#9b3050', '#6e1f3a'], pourFullMs: 2600, viscosity: '중간', foam: false, celebrate: false,
      bottle: assetUrl('bottles/wine.png'), bottleOpen: assetUrl('bottles/wine_open.png'), glass: assetUrl('glasses/wine.svg'), glassFilled: assetUrl('glasses_filled/wine.png'), sound: assetUrl('sounds/pour/soju.mp3'), frames: 0,
      glassAspect: 48 / 73,
      bowl: {
        top: 2,
        bottom: 59,
        left: 7,
        right: 98
      },
      liquidShape: {
        viewBox: '0 0 43 41',
        path: 'M2.84583 1.05212C5.70829 -0.344767 34.075 0.0521053 38.8458 0.0521013C43.6166 0.0520973 44.8458 28.0521 33.3458 35.0521C21.8458 42.0521 20.3458 42.5521 8.34584 35.0521C-3.65416 27.5521 -0.0166278 2.44901 2.84583 1.05212Z'
  } },
  { key: 'makgeolli', label: '막걸리', colors: ['#F4EFE6', '#E3DCCB'], pourFullMs: 2800, viscosity: '걸쭉', foam: false, celebrate: false,
    bottle: assetUrl('bottles/makgeolli.png'), bottleOpen: assetUrl('bottles/makgeolli_open.png'), glass: assetUrl('glasses/makgeolli.svg'), glassFilled: assetUrl('glasses_filled/makgeolli.png'), sound: assetUrl('sounds/pour/soju.mp3'), frames: 0,
    // 막걸리 병 PNG는 정사각(1254×1254)이라 contain 박스에서 다른 병(비율 0.667)보다 작게 렌더됨 → 보정 확대.
    // // ASSUMPTION: bottleScale 값은 시각 보정용 임의값 — 화면 확인 후 조정.
    bottleScale: 1.3,
    glassAspect: 71 / 54,
      bowl: {
        top: 23,
        bottom: 63,
        left: 23,
        right: 78,
        clip: 'polygon(0% 0%, 100% 0%, 68% 87%, 50% 100%, 32% 87%)'
      },
      liquidShape: {
        viewBox: '0 0 41 26',
        path: 'M2.09619 0.44441C5.09617 -0.555515 33.0962 0.444413 38.0962 0.44441C43.0962 0.444407 41.0962 19.5277 34.0962 22.4444C27.0961 25.361 17.0962 26.4443 7.59622 22.4444C-1.90375 18.4444 -0.903786 1.44433 2.09619 0.44441Z'
} },
  // 샴페인: 새 세트로 병·잔·채워진잔 확보(CSS 폴백 해제). 코르크·뚜껑열린병은 S-05용(champagne/ 배치, 미연결).
  { key: 'champagne', label: '샴페인', colors: ['#F2D89A', '#D9B65E'], pourFullMs: 2400, viscosity: '발포', foam: false, celebrate: true,
  bottle: assetUrl('bottles/champagne.png'), bottleOpen: assetUrl('bottles/champagne_open.png'), glass: assetUrl('glasses/champagne.svg'), glassFilled: assetUrl('glasses_filled/champagne.png'), sound: assetUrl('sounds/pour/beer.mp3'), frames: 0,
  glassAspect: 28 / 96,
  bowl: {
    top: 2,
    bottom: 63,
    left: 7,
    right: 92
  },
  liquidShape: {
    viewBox: '0 0 23 60',
    path: 'M0.522504 5.48115C0.739061 2.38549 3.34071 0 6.44393 0H16.3354C19.5007 0 22.129 2.46027 22.2672 5.62257C23.2018 27.0156 21.564 46.681 16.9646 54.5C11.9647 63 8.46463 60 6.46463 54.5C4.56302 49.2705 -1.85875 39.5209 0.522504 5.48115Z'
  } },
]
export const DRINK_MAP = Object.fromEntries(DRINKS.map((d) => [d.key, d]))

// 소주 따르기 프레임 URL (1-기반, 0패딩 2자리).
export const sojuFrameUrl = (n) => assetUrl(`pour/soju/frame_${String(n).padStart(2, '0')}.png`)

// 모드 프리셋 — F-MD-02(혼술)·F-MD-03(술자리). 연출 속도 배수·톤.
// speed = 따르기 시간 배수(>1 느림 / <1 빠름).
// // ASSUMPTION: 속도 배수·톤 라벨은 임의값. 분위기 연출에 한정(폭음·원샷 강요 톤 금지).
export const MODES = [
  { key: 'solo', label: '혼술 모드', cap: '잔잔한 BGM · 천천히 음미', speed: 1.25, tone: 'calm', bgm: assetUrl('sounds/bgm/calm.mp3') },
  { key: 'party', label: '술자리 모드', cap: '활기찬 분위기 · 건배방 이용 가능', speed: 0.8, tone: 'lively', bgm: assetUrl('sounds/bgm/lively.mp3') },
]
export const MODE_MAP = Object.fromEntries(MODES.map((m) => [m.key, m]))
