import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PourInteraction from './PourInteraction.jsx'
import { useAppStore } from '../store/useAppStore.js'

// phonesul-react-with-assets_3 방식: 롱프레스(500ms)→자동 채움(soju 5000ms, mode=null speed 1)→마시기, 탭 4번→비움.
function renderPour() {
  return render(
    <MemoryRouter>
      <PourInteraction />
    </MemoryRouter>,
  )
}
const idleOf = (c) => c.querySelector('.pour-idle')
const glassOf = (c) => c.querySelector('.drink-glass-tap')

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  useAppStore.getState().setDrink('soju')
  useAppStore.setState({ mode: null }) // speed 1.0
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// 롱프레스→가득→마시기 진입까지 진행.
function fillToDrink(container) {
  fireEvent.mouseDown(idleOf(container))
  act(() => vi.advanceTimersByTime(500)) // 롱프레스 인식 → 따르기 시작
  act(() => vi.advanceTimersByTime(5000 + 300)) // 채움(5s) + 마시기 전환(300)
}

describe('S-04 상태 순환 (phonesul-react-with-assets_3 방식)', () => {
  it('롱프레스 500ms 전에 떼면 따르기 시작 안 함', () => {
    const { container } = renderPour()
    const idle = idleOf(container)
    fireEvent.mouseDown(idle)
    act(() => vi.advanceTimersByTime(300)) // < 500
    fireEvent.mouseUp(idle)
    act(() => vi.advanceTimersByTime(500))
    expect(container.textContent).toContain('길게 눌러 따르기') // 여전히 대기
    expect(container.textContent).not.toContain('탭해서 비우기')
  })

  it('롱프레스로 따르기 시작 → 가득 차면 마시기로 진입', () => {
    const { container } = renderPour()
    fillToDrink(container)
    expect(container.textContent).toContain('탭해서 비우기')
  })

  it('마시기 탭 4번 → "캬~" → 빈잔 → 대기 복귀', () => {
    const { container } = renderPour()
    fillToDrink(container)
    const glass = glassOf(container)
    for (let i = 0; i < 4; i++) fireEvent.click(glass)
    expect(container.textContent).toContain('캬~') // 비움 직후
    act(() => vi.advanceTimersByTime(400)) // 빈잔 오버레이
    act(() => vi.advanceTimersByTime(2000)) // 대기 복귀
    expect(container.textContent).toContain('길게 눌러 따르기')
  })
})

describe('안정성 — 반복 전환 누수 없음 (비기능 §6)', () => {
  it('5회 따르기/마시기 사이클 후에도 정상 대기 상태', () => {
    const { container } = renderPour()
    for (let n = 0; n < 5; n++) {
      fillToDrink(container)
      const glass = glassOf(container)
      for (let i = 0; i < 4; i++) fireEvent.click(glass)
      act(() => vi.advanceTimersByTime(400))
      act(() => vi.advanceTimersByTime(2000))
    }
    expect(container.textContent).toContain('길게 눌러 따르기')
  })

  it('언마운트 시 타이머 정리(cleanup) 호출', () => {
    const clearTO = vi.spyOn(globalThis, 'clearTimeout')
    const clearIV = vi.spyOn(globalThis, 'clearInterval')
    const { container, unmount } = renderPour()
    fireEvent.mouseDown(idleOf(container)) // pressTimer 생성
    unmount()
    expect(clearTO).toHaveBeenCalled()
    expect(clearIV).toHaveBeenCalled()
  })
})
