// 사운드·햅틱 피드백 인터페이스 — 코어 단계는 mock 구현.
//
// // UNVERIFIED: 실제 사운드 재생, 앱인토스 generateHapticFeedback, 무음 모드 존중(F-SY-03),
//   백그라운드 전환 시 정지/복귀(F-SY-04)는 토스 WebView 실기기에서만 검증 가능.
//   여기서는 인터페이스와 mock(설정 존중 + 콘솔/데스크톱 폴백)만 둔다. 실제 연결은 후속 단계.
import { useAppStore } from '../store/useAppStore.js'

// 데스크톱 테스트 편의용 햅틱 세기(ms). 실제 햅틱은 SDK로 대체된다.
const VIBRATE_MS = { light: 8, medium: 18, strong: 40 }

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
  // mock: 앱인토스 햅틱 SDK 대신 데스크톱 navigator.vibrate 폴백(대개 no-op). TODO(S2): SDK 연결.
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(VIBRATE_MS[type] ?? 10)
  } else if (import.meta.env.DEV) {
    console.debug('[haptic]', type)
  }
}
