// 사운드 정책(시스템 자동 동작) — F-SY-03 무음 모드 존중 / F-SY-04 백그라운드 사운드 제어.
// 사용자 설정이 아니라 OS 정책·앱 라이프사이클에 따라 항상 적용된다(화면설계서 S-09 note).
//
// ⚠️ onAudioFocusChanged(React Native 전용 API)는 사용하지 않는다.
//    WebView 표준 document.visibilitychange만 사용한다(context §4: RN 금지).
//
// // UNVERIFIED: 무음 모드 감지·실제 오디오 정지/재개는 토스 WebView 실기기에서만 검증 가능. 여기선 mock.
// // REVIEW(복귀 BGM 동작): 백그라운드→포그라운드 복귀 시 BGM 재생은 과거 반려 사례.
//    반드시 대상 실행 환경(토스 WebView)에서 사람이 동작 확인할 것(context §4·§10).
import { useAppStore } from '../store/useAppStore.js'
import { stopPourSound } from './feedback.js'
import { MODE_MAP } from '../data/presets.js'

let bgmAudio = null
let bgmMode = null

// F-SY-03: 기기 무음 모드면 사운드 억제.
export function isSilentMode() {
  // // UNVERIFIED: 웹 표준만으로 기기 무음 모드를 신뢰성 있게 감지할 수 없음. 실기기/SDK 확인 필요.
  return false // mock: 무음 아님으로 가정
}

// 모드별 BGM 재생(혼술=잔잔 / 술자리=신나는). 루프, 사운드 설정·무음 모드 종속.
//   효과음보다 작게(0.45). 같은 모드 트랙이 이미 재생 중이면 유지(중복 시작 방지).
export function startBgm(mode) {
  if (!useAppStore.getState().settings.sound) return // F-SY-01
  if (isSilentMode()) return // F-SY-03
  const track = MODE_MAP[mode]?.bgm
  if (!track) return // 모드 미설정/트랙 없음 → 무음
  if (bgmAudio && bgmMode === mode && !bgmAudio.paused) return // 이미 재생 중
  stopBgm()
  bgmMode = mode
  try {
    bgmAudio = new Audio(track)
    bgmAudio.loop = true
    bgmAudio.volume = 0.45
    const p = bgmAudio.play()
    if (p && typeof p.catch === 'function') p.catch(() => {}) // 자동재생 차단 등 무시
  } catch {
    bgmAudio = null
  }
}

export function stopBgm() {
  if (bgmAudio) {
    try {
      bgmAudio.pause()
      bgmAudio.currentTime = 0
    } catch {
      /* ignore */
    }
    bgmAudio = null
  }
}

export function isBgmPlaying() {
  return !!bgmAudio && !bgmAudio.paused
}

// F-SY-04: 백그라운드 전환 시 즉시 정지, 복귀 시 재생.
function handleVisibility() {
  if (document.hidden) {
    // 백그라운드: 즉시 정지(BGM + 진행 중 따르기 사운드). 백그라운드 음원 무단 재생 금지.
    stopBgm()
    stopPourSound()
    if (import.meta.env.DEV) console.debug('[audio] background → 정지')
  } else {
    // 포그라운드 복귀: BGM 재생 재개.
    // // REVIEW(복귀 BGM 동작): 토스 WebView 실기기에서 복귀 시 재생 동작 반드시 확인(과거 반려).
    const { mode, settings } = useAppStore.getState()
    if (settings.sound && !isSilentMode()) startBgm(mode)
    if (import.meta.env.DEV) console.debug('[audio] foreground → 복귀')
  }
}

// App 마운트 시 1회 설치. 반환값(cleanup)으로 해제.
export function installAudioPolicy() {
  if (typeof document === 'undefined') return () => {}
  document.addEventListener('visibilitychange', handleVisibility)
  return () => document.removeEventListener('visibilitychange', handleVisibility)
}
