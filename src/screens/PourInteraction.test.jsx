import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PourInteraction from './PourInteraction.jsx'
import { useAppStore } from '../store/useAppStore.js'

// 동작 모델(현행 PourInteraction.jsx): 포인터로 누르면 즉시 따르기 시작(롱프레스 게이트 없음).
//   누르는 동안 자동 채움(soju, mode=null → 5000ms) → 가득 차면 마시기 진입 → 탭 4번에 비움 → 대기 복귀.
//   인터랙션은 Pointer 이벤트(onPointerDown/Up)라 테스트도 pointerDown/Up로 발생시켜야 한다(mouseDown은 안 잡힘).
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
  useAppStore.setState({ mode: null }) // speed 1.0 → 채움 5000ms
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// 누르기 → 가득 채움 → 마시기 진입까지 진행.
function fillToDrink(container) {
  fireEvent.pointerDown(idleOf(container)) // 누르는 즉시 따르기 시작
  act(() => vi.advanceTimersByTime(5000 + 300)) // 채움(5s) + 마시기 전환 여유
}

describe('S-04 상태 순환 (현행 PourInteraction)', () => {
  it('누르면 즉시 따르기 시작(롱프레스 게이트 없음)', () => {
    const { container } = renderPour()
    fireEvent.pointerDown(idleOf(container))
    act(() => vi.advanceTimersByTime(200)) // 짧게 눌러도 이미 따르는 중
    expect(container.textContent).toContain('누르는 동안 차오름')
    expect(container.textContent).not.toContain('탭해서 비우기') // 아직 가득 아님
  })

  it('누른 채로 가득 차면 마시기로 진입', () => {
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
    expect(container.textContent).toContain('누르고 따르기')
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
    expect(container.textContent).toContain('누르고 따르기')
  })

  it('언마운트 시 타이머 정리(cleanup) 호출', () => {
    const clearTO = vi.spyOn(globalThis, 'clearTimeout')
    const clearIV = vi.spyOn(globalThis, 'clearInterval')
    const { container, unmount } = renderPour()
    fireEvent.pointerDown(idleOf(container)) // fillTimer 생성
    unmount()
    expect(clearTO).toHaveBeenCalled()
    expect(clearIV).toHaveBeenCalled()
  })
})
