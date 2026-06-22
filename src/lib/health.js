// 건강 기록 환산 순수 계산 — 단위 테스트 대상(F-HL-02).
// 누적 잔 수 × 잔당 고정 계수(presets). 음수 입력은 0으로 보정.
import { SAVED_WON_PER_GLASS, SAVED_KCAL_PER_GLASS } from '../data/presets.js'

export function savedWon(count) {
  return Math.max(0, Math.floor(count)) * SAVED_WON_PER_GLASS
}

export function savedKcal(count) {
  return Math.max(0, Math.floor(count)) * SAVED_KCAL_PER_GLASS
}
