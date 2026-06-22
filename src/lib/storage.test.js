import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadState, saveState } from './storage.js'

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('storage mock — 저장/복원 (F-SY-01·02 설정 지속, F-HL-01 누적 지속)', () => {
  it('없으면 null', () => {
    expect(loadState()).toBeNull()
  })

  it('saveState → loadState 라운드트립', () => {
    saveState({ mode: 'solo' })
    expect(loadState()).toEqual({ mode: 'solo' })
  })

  it('부분 병합(기존 키 보존)', () => {
    saveState({ mode: 'party' })
    saveState({ settings: { sound: false, haptic: true } })
    saveState({ record: { pourCount: 3 } })
    expect(loadState()).toEqual({
      mode: 'party',
      settings: { sound: false, haptic: true },
      record: { pourCount: 3 },
    })
  })
})

describe('store — 변경 시 저장 / 재진입 시 복원', () => {
  it('액션이 변경값을 영속화한다', async () => {
    const { useAppStore } = await import('../store/useAppStore.js')
    useAppStore.getState().setSound(false)
    useAppStore.getState().setHaptic(false)
    useAppStore.getState().setMode('party')
    useAppStore.getState().incrementPour()

    const saved = loadState()
    expect(saved.settings).toEqual({ sound: false, haptic: false })
    expect(saved.mode).toBe('party')
    expect(saved.record.pourCount).toBe(1)
  })

  it('재진입(스토어 재로드) 시 저장된 값으로 초기화된다', async () => {
    // 저장 상태를 미리 심고, 스토어 모듈을 새로 import → 부팅 시 복원되는지.
    saveState({ mode: 'solo', settings: { sound: false, haptic: false }, record: { pourCount: 7 } })
    vi.resetModules()
    const { useAppStore } = await import('../store/useAppStore.js')
    const s = useAppStore.getState()
    expect(s.mode).toBe('solo')
    expect(s.settings).toEqual({ sound: false, haptic: false })
    expect(s.record.pourCount).toBe(7)
  })
})
