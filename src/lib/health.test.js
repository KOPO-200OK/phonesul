import { describe, it, expect } from 'vitest'
import { savedWon, savedKcal } from './health.js'
import { SAVED_WON_PER_GLASS, SAVED_KCAL_PER_GLASS } from '../data/presets.js'

describe('건강 환산 — 누적 × 잔당 고정 계수 (F-HL-02)', () => {
  it('0잔이면 0', () => {
    expect(savedWon(0)).toBe(0)
    expect(savedKcal(0)).toBe(0)
  })

  it('잔 수에 계수를 곱한다', () => {
    expect(savedWon(24)).toBe(24 * SAVED_WON_PER_GLASS)
    expect(savedKcal(24)).toBe(24 * SAVED_KCAL_PER_GLASS)
  })

  it('화면설계서 S-08 예시값과 정합 (계수 기준)', () => {
    // 24잔 → ₩28,800 / 3,360kcal (₩1,200 · 140kcal 계수일 때)
    expect(savedWon(24)).toBe(28800)
    expect(savedKcal(24)).toBe(3360)
  })

  it('음수/소수 입력 방어', () => {
    expect(savedWon(-5)).toBe(0)
    expect(savedKcal(2.9)).toBe(2 * SAVED_KCAL_PER_GLASS)
  })
})
