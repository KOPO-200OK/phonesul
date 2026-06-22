import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from './App.jsx'
import { useAppStore } from './store/useAppStore.js'

// 통합/흐름: 스플래시 → 모드 → 술 선택 → 따르기 → 마시기 → 순환 → 건강 기록.
let now = 0
beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  useAppStore.getState().resetRecord()
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('전체 흐름 (S-02→S-03→S-04→S-08)', () => {
  it('모드·술 선택 후 한 잔 비우면 기록에 누적·환산 반영', () => {
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
    for (let i = 0; i < 4; i++) fireEvent.pointerDown(stage)
    expect(useAppStore.getState().record.pourCount).toBe(1)
    act(() => vi.advanceTimersByTime(1200)) // 순환: 대기 복귀

    // S-08 건강 기록
    fireEvent.click(screen.getByText('나의 기록'))
    expect(screen.getByText('아낀 술값')).toBeInTheDocument()
    // 1잔 → ₩1,200 / 140 kcal (계수 기준)
    expect(container.textContent).toContain('₩1,200')
    expect(container.textContent).toContain('140 kcal')
  })
})
