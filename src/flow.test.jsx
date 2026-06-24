import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from './App.jsx'

// 통합/흐름: 스플래시 → 모드 → 술 선택 → 따르기(롱프레스) → 마시기(탭) → 순환(대기 복귀).
// phonesul-react-with-assets_3 방식. 혼술(solo) speed 1.25 → 채움 6250ms.
beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('전체 흐름 (S-02→S-03→S-04 순환)', () => {
  it('모드·술 선택 후 따르기→마시기→비움→대기 복귀', () => {
    const { container } = render(<App />)

    act(() => vi.advanceTimersByTime(3000))          // S-01 로딩 바 → S-02 자동 진입
    fireEvent.click(screen.getByText('혼술 모드'))   // S-02 모드 선택
    fireEvent.click(screen.getByText('소주'))        // S-03 술 선택

    // S-04 따르기(롱프레스 → 자동 채움 → 마시기)
    const idle = container.querySelector('.pour-idle')
    expect(idle).toBeTruthy()
    fireEvent.mouseDown(idle)
    act(() => vi.advanceTimersByTime(500))   // 롱프레스 인식
    act(() => vi.advanceTimersByTime(8000))  // 채움(6250) + 마시기 전환
    expect(container.textContent).toContain('탭해서 비우기')

    // 마시기(탭 4번) → 비움 → 대기 복귀
    const glass = container.querySelector('.drink-glass-tap')
    for (let i = 0; i < 4; i++) fireEvent.click(glass)
    act(() => vi.advanceTimersByTime(400))
    act(() => vi.advanceTimersByTime(2000))
    expect(container.textContent).toContain('길게 눌러 따르기')
  })
})
