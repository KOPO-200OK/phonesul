// 사운드·햅틱 피드백 인터페이스.
//   햅틱: 앱인토스 generateHapticFeedback SDK 연결됨(데스크톱/브라우저는 navigator.vibrate 폴백).
//   사운드(효과음): 아직 mock(콘솔 로그). 따르기 사운드만 실제 Audio 재생.
//
// // UNVERIFIED: 실기기 토스 WebView에서 햅틱 실제 동작, 무음 모드 존중(F-SY-03),
//   백그라운드 전환 시 정지/복귀(F-SY-04)는 샌드박스/실기기에서만 최종 검증 가능.
import { useAppStore } from '../store/useAppStore.js'

// 데스크톱/브라우저 폴백용 햅틱 세기(ms; pop은 흔들리는 패턴 배열). 실기기는 SDK 햅틱을 쓴다.
const VIBRATE_MS = { light: 8, medium: 18, strong: 40, pop: [30, 30, 30, 30, 60] }

// 앱인토스 햅틱 타입 매핑(web-bridge generateHapticFeedback).
//   호출부 의미(light/medium/strong/pop)는 그대로 두고 여기서만 SDK 타입에 매핑한다.
//   pop = wiggle(축포처럼 흔들리는 진동), strong = basicMedium(강한 기본 진동).
const HAPTIC_SDK_TYPE = { light: 'tickWeak', medium: 'tickMedium', strong: 'basicMedium', pop: 'wiggle' }

export function playSound(name) {
  // F-SY-01: 사운드 Off면 재생 안 함. (무음 모드 존중 F-SY-03은 실기기 필요 → UNVERIFIED)
  if (!useAppStore.getState().settings.sound) return
  // mock: 실제 오디오 재생 대신 로그만. TODO(S2): 오디오 에셋 + 무음/백그라운드 정책 연결.
  if (import.meta.env.DEV) console.debug('[sound]', name)
}

// 따르기 사운드(파일 기반, 소주·맥주 보유) — 누르는 동안 루프 재생.
// // UNVERIFIED: 브라우저 자동재생 정책·앱인토스 무음/백그라운드 정책은 실기기 검증 필요.
let pourAudio = null

export function startPourSound(url) {
  stopPourSound()
  if (!url) return // 사운드 미보유 종류 → 무음(시각 피드백은 유지)
  if (!useAppStore.getState().settings.sound) return // F-SY-01
  try {
    pourAudio = new Audio(url)
    pourAudio.loop = true
    const p = pourAudio.play()
    if (p && typeof p.catch === 'function') p.catch(() => {}) // 자동재생 차단 등 무시
  } catch {
    pourAudio = null
  }
}

export function stopPourSound() {
  if (!pourAudio) return
  try {
    pourAudio.pause()
    pourAudio.currentTime = 0
  } catch {
    /* ignore */
  }
  pourAudio = null
}

export function haptic(type = 'light') {
  // F-SY-02: 진동 Off면 호출 안 함(단, 시각·청각 피드백은 화면에서 항상 유지 — 접근성).
  if (!useAppStore.getState().settings.haptic) return
  // 실기기 토스 WebView는 SDK 햅틱, 데스크톱/브라우저는 navigator.vibrate 폴백.
  //   렌더 핸들러에서 호출되므로 sync 유지 — 비동기 SDK는 fire-and-forget.
  triggerHaptic(type)
}

// 프레임워크는 동적 import — share.js와 동일 패턴(데스크톱/테스트는 모듈 그래프에 안 끌려오고,
//   실기기 토스 WebView에서만 로드·호출. 비-토스 환경이면 호출 시 throw → 폴백).
// // UNVERIFIED: 토스 WebView 실기기에서 generateHapticFeedback 실제 동작 — 샌드박스 확인.
async function triggerHaptic(type) {
  // 1) 앱인토스 SDK 햅틱 (실기기 토스 WebView)
  try {
    const { generateHapticFeedback } = await import('@apps-in-toss/web-framework')
    await generateHapticFeedback({ type: HAPTIC_SDK_TYPE[type] ?? 'tickWeak' })
    return
  } catch {
    // SDK 미지원 환경(데스크톱/브라우저)·브리지 없음 → 폴백
  }
  // 2) 웹 표준 진동 폴백(대개 데스크톱은 no-op)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(VIBRATE_MS[type] ?? 10)
  } else if (import.meta.env.DEV) {
    console.debug('[haptic]', type)
  }
}
