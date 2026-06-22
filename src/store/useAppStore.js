// 전역 상태관리 — zustand. mock storage로 영속화(부팅 시 로드 / 변경 시 저장).
//
// context §3 데이터 구조:
//  - mode             : 마지막 선택 모드(solo/party)        → 로컬 영구
//  - drink            : 현재 선택 술(5종 키)                 → 세션(미영속)
//  - settings.sound   : 사운드 On/Off (F-SY-01)             → 로컬 영구
//  - settings.haptic  : 진동 On/Off (F-SY-02)               → 로컬 영구
//
// 술/모드 데이터는 src/data/presets.js가 단일 출처.
// (v0.2: 기록 기능 F-HL 제거 — 누적 잔 수 상태 없음)
import { create } from 'zustand'
import { loadState, saveState } from '../lib/storage.js'

const persisted = loadState() ?? {}

const initialState = {
  mode: persisted.mode ?? null,
  drink: null,
  settings: {
    sound: persisted.settings?.sound ?? true,
    haptic: persisted.settings?.haptic ?? true,
  },
}

export const useAppStore = create((set) => ({
  ...initialState,

  setMode: (mode) => {
    set({ mode })
    saveState({ mode }) // 마지막 모드 저장
  },

  setDrink: (drink) => set({ drink }), // 세션값(미영속)

  setSound: (sound) =>
    set((s) => {
      const settings = { ...s.settings, sound }
      saveState({ settings })
      return { settings }
    }),

  setHaptic: (haptic) =>
    set((s) => {
      const settings = { ...s.settings, haptic }
      saveState({ settings })
      return { settings }
    }),
}))
