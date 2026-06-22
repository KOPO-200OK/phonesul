import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom에 PointerEvent가 없어 fireEvent.pointer*가 실패 → 최소 폴리필.
if (typeof globalThis.PointerEvent === 'undefined') {
  globalThis.PointerEvent = class PointerEvent extends MouseEvent {}
}

// rAF는 jsdom에 없음. 기본 no-op 스텁(따르기 전환은 performance.now 기반이라 애니메이션 루프 불필요).
// 개별 테스트에서 vi.spyOn으로 호출 검증 가능하도록 globalThis 프로퍼티로 정의.
globalThis.requestAnimationFrame = () => 0
globalThis.cancelAnimationFrame = () => {}

// jsdom은 HTMLMediaElement.play/pause 미구현 → 따르기 사운드 테스트 시 에러. 무해 스텁으로 대체.
if (globalThis.HTMLMediaElement) {
  HTMLMediaElement.prototype.play = () => Promise.resolve()
  HTMLMediaElement.prototype.pause = () => {}
}

afterEach(() => {
  cleanup()
  try {
    localStorage.clear()
  } catch {
    /* ignore */
  }
})
