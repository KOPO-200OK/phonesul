import { describe, it, expect } from 'vitest'
import { computeFill, isHollow, decrementDrink, frameIndexFromFill, HOLLOW_THRESHOLD, DRINK_PER_TAP } from './pour.js'

describe('computeFill — 따르기 수위 계산 (F-CR-02)', () => {
  it('누름 지속시간에 비례해 0~100% 매핑', () => {
    expect(computeFill(0, 2000)).toBe(0)
    expect(computeFill(1000, 2000)).toBe(50)
    expect(computeFill(2000, 2000)).toBe(100)
  })

  it('가득 차면 100 상한 — 넘침 없음', () => {
    expect(computeFill(5000, 2000)).toBe(100)
  })

  it('음수/0 fullMs 등 비정상 입력 방어', () => {
    expect(computeFill(-100, 2000)).toBe(0)
    expect(computeFill(1000, 0)).toBe(100)
    expect(computeFill(1000, -5)).toBe(100)
  })
})

describe('isHollow — 헛누름 8% 분기 (F-CR-04)', () => {
  it('임계값 기본 8%', () => {
    expect(HOLLOW_THRESHOLD).toBe(8)
  })
  it('8% 미만이면 헛누름(마시기로 안 감)', () => {
    expect(isHollow(0)).toBe(true)
    expect(isHollow(5)).toBe(true)
    expect(isHollow(7.99)).toBe(true)
  })
  it('8% 이상이면 마시기로 진행', () => {
    expect(isHollow(8)).toBe(false)
    expect(isHollow(50)).toBe(false)
    expect(isHollow(100)).toBe(false)
  })
})

describe('decrementDrink — 탭 비우기 (F-CR-03)', () => {
  it('탭당 기본 25% 감소', () => {
    expect(DRINK_PER_TAP).toBe(25)
    expect(decrementDrink(100)).toBe(75)
    expect(decrementDrink(75)).toBe(50)
  })
  it('0 미만으로 내려가지 않음', () => {
    expect(decrementDrink(20)).toBe(0)
    expect(decrementDrink(0)).toBe(0)
  })
  it('100%에서 4탭이면 비움(0)', () => {
    let v = 100
    for (let i = 0; i < 4; i++) v = decrementDrink(v)
    expect(v).toBe(0)
  })
})

describe('frameIndexFromFill — 차오름→프레임 매핑 (소주 30프레임)', () => {
  it('0%는 첫 프레임, 100%는 마지막 프레임', () => {
    expect(frameIndexFromFill(0, 30)).toBe(1)
    expect(frameIndexFromFill(100, 30)).toBe(30)
  })
  it('범위를 1~frameCount로 클램프', () => {
    expect(frameIndexFromFill(-50, 30)).toBe(1)
    expect(frameIndexFromFill(999, 30)).toBe(30)
  })
  it('프레임 없으면(0) 항상 1', () => {
    expect(frameIndexFromFill(50, 0)).toBe(1)
  })
  it('중간값은 단조 증가', () => {
    const a = frameIndexFromFill(25, 30)
    const b = frameIndexFromFill(50, 30)
    const c = frameIndexFromFill(75, 30)
    expect(a).toBeLessThan(b)
    expect(b).toBeLessThan(c)
  })
})
