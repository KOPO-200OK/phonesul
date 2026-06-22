import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PourInteraction from './PourInteraction.jsx'
import { useAppStore } from '../store/useAppStore.js'

// soju fullMs=2000, mode=null → speed 1.0 → 0→100% 도달은 2000ms.
let now = 0
function renderPour() {
  return render(
    <MemoryRouter>
      <PourInteraction />
    </MemoryRouter>,
  )
}
const stageOf = (c) => c.querySelector('.pour-stage')

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  useAppStore.getState().setDrink('soju')
  useAppStore.getState().resetRecord()
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// 한 번의 따르기(가득)→마시기(완전 비움) 사이클 수행. 비움 시 누적 +1.
function pourAndEmpty(stage) {
  now = 0
  fireEvent.pointerDown(stage) // 대기 → 따르기 시작
  now = 2000 // 100%
  fireEvent.pointerUp(stage) // 따르기 → 마시기
  for (let i = 0; i < 4; i++) fireEvent.pointerDown(stage) // 25%×4 → 0 → 비움
  act(() => vi.advanceTimersByTime(1200)) // 비움 → 대기 복귀
}

describe('S-04 상태 순환 (F-CR-02·03·04)', () => {
  it('헛누름: 떼는 수위 < 8%면 마시기로 안 가고 대기 복귀', () => {
    const { container } = renderPour()
    const stage = stageOf(container)
    now = 0
    fireEvent.pointerDown(stage)
    now = 100 // 100/2000 = 5% (<8%)
    fireEvent.pointerUp(stage)
    expect(container.textContent).toContain('길게 눌러 따르기') // 대기 상태 문구
    expect(container.textContent).not.toContain('탭해서 비우기')
    expect(useAppStore.getState().record.pourCount).toBe(0)
  })

  it('정상 따르기: 8% 이상이면 마시기로 진행', () => {
    const { container } = renderPour()
    const stage = stageOf(container)
    now = 0
    fireEvent.pointerDown(stage)
    now = 400 // 20% (>=8%)
    fireEvent.pointerUp(stage)
    expect(container.textContent).toContain('탭해서 비우기')
  })

  it('마시기 4탭 → 비움("캬~") → 누적 +1 → 대기 복귀', () => {
    const { container } = renderPour()
    const stage = stageOf(container)
    pourAndEmpty(stage)
    expect(useAppStore.getState().record.pourCount).toBe(1)
    // 비움 후 대기 복귀
    expect(container.textContent).toContain('길게 눌러 따르기')
  })
})

describe('안정성 — 반복 전환 누수 없음 (비기능 §6)', () => {
  it('10회 따르기/마시기 사이클에서 누적이 정확히 10', () => {
    const { container } = renderPour()
    const stage = stageOf(container)
    for (let i = 0; i < 10; i++) pourAndEmpty(stage)
    expect(useAppStore.getState().record.pourCount).toBe(10)
  })

  it('언마운트 시 rAF·타이머 정리(cleanup) 호출', () => {
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame')
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { container, unmount } = renderPour()
    const stage = stageOf(container)
    now = 0
    fireEvent.pointerDown(stage) // 따르기 시작(타이머/rAF 참조 생성 가능)
    unmount()
    expect(cancelSpy).toHaveBeenCalled()
    expect(clearSpy).toHaveBeenCalled()
  })
})
