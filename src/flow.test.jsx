import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from './App.jsx'

// 통합/흐름: 스플래시 → 모드 → 술 선택 → 따르기 → 마시기 → 순환(대기 복귀).
// (v0.2: 기록 기능 F-HL 제거 — 흐름은 S-04 순환까지)
let now = 0
beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('전체 흐름 (S-02→S-03→S-04 순환)', () => {
  it('모드·술 선택 후 따르기→마시기→비움→대기 복귀', () => {
    const { container } = render(<App />)

    // S-01 → S-02
    fireEvent.click(screen.getByText('시작'))
    // S-02 모드 선택 (혼술)
    fireEvent.click(screen.getByText('혼술 모드'))
    // S-03 술 선택 (소주)
    fireEvent.click(screen.getByText('소주'))

    // S-04 따르기 → 마시기 → 비움
    const stage = container.querySelector('.pour-stage')
    expect(stage).toBeTruthy()
    now = 0
    fireEvent.pointerDown(stage)
    now = 4000 // 충분히 길게 → 100%
    fireEvent.pointerUp(stage)
    expect(container.textContent).toContain('탭해서 비우기')
    for (let i = 0; i < 4; i++) fireEvent.pointerDown(stage) // 비움

    // 순환: 비움 후 대기 복귀
    act(() => vi.advanceTimersByTime(1200))
    expect(container.textContent).toContain('길게 눌러 따르기')
  })
})
