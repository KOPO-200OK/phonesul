// S-04 음주 인터랙션 — 단일 라우트, 내부 3상태 순환.
//   F-CR-02(따르기/롱프레스→차오름) · F-CR-03(마시기/탭→비움) · F-CR-04(순환·헛누름 분기).
// 화면설계서 §03 note: 라우트는 하나, 전환은 요소 등장/퇴장(페이드)으로 처리, 가득 차면 정지(넘침 없음).
// 비게임(context §6): 점수·목표·엔딩 없음. 대기↔따르기↔마시기 무한 반복.
// 문구: context §5.1 금지→대체 표 준수(음주 권장 톤 금지).
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { playSound, haptic } from '../lib/feedback.js'
import { DRINK_MAP, MODE_MAP } from '../data/presets.js'
import { computeFill, isHollow, decrementDrink } from '../lib/pour.js'

const PHASE = { IDLE: 'idle', POURING: 'pouring', DRINKING: 'drinking', EMPTY: 'empty' }

// // ASSUMPTION: 비움 노출 시간은 임의값. 임계값·감소량은 lib/pour.js로 추출(단위 테스트 대상).
const EMPTY_HOLD_MS = 1200 // 비움("캬~") 노출 후 대기 복귀까지
// 종류별 점도(차오름 속도)·색은 presets.js 단일 출처(F-CR-01). 모드(F-MD)는 속도 배수로 반영.

export default function PourInteraction() {
  const navigate = useNavigate()
  const drinkKey = useAppStore((s) => s.drink) ?? 'soju'
  const mode = useAppStore((s) => s.mode)
  const incrementPour = useAppStore((s) => s.incrementPour)

  const [phase, setPhase] = useState(PHASE.IDLE)
  const [fill, setFill] = useState(0) // 0~100

  const rafRef = useRef(0)
  const pourStartRef = useRef(0)
  const emptyTimerRef = useRef(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const drink = DRINK_MAP[drinkKey] ?? DRINK_MAP.soju
  // 점도(종류) × 모드 속도 배수 = 실제 따르기 시간(F-CR-01 + F-MD-02/03).
  const fullMs = drink.pourFullMs * (MODE_MAP[mode]?.speed ?? 1)
  const [c0, c1] = drink.colors

  // 언마운트 정리 — 누수 방지(비기능: 상태 전환 반복 시 누수 없음).
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(emptyTimerRef.current)
  }, [])

  const currentFill = (now) => computeFill(now - pourStartRef.current, fullMs)

  const startPour = useCallback(() => {
    setPhase(PHASE.POURING)
    pourStartRef.current = performance.now()
    playSound('pour')
    haptic('light')
    const tick = (now) => {
      const next = currentFill(now)
      setFill(next)
      if (next < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = 0 // 가득 차면 정지(넘침 없음)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [fullMs])

  const endPour = useCallback(() => {
    if (phaseRef.current !== PHASE.POURING) return
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    // 떼는 시점 실제 수위를 refs로 계산(상태 지연 방지).
    const level = currentFill(performance.now())
    setFill(level)
    playSound('pour_stop')
    if (isHollow(level)) {
      // F-CR-04 헛누름: 마시기로 가지 않고 대기 복귀.
      setFill(0)
      setPhase(PHASE.IDLE)
    } else {
      setPhase(PHASE.DRINKING)
    }
  }, [fullMs])

  const drinkTap = useCallback(() => {
    if (phaseRef.current !== PHASE.DRINKING) return
    playSound('gulp')
    haptic('medium')
    // 부수효과는 updater 밖에서(StrictMode 이중 호출로 누적 중복 방지).
    const next = decrementDrink(fill)
    setFill(next)
    if (next <= 0) {
      // 비움 완료 → "캬~" + 빈 잔, 누적 +1(F-HL-01), 잠시 후 대기 복귀.
      playSound('ahh')
      incrementPour()
      setPhase(PHASE.EMPTY)
      emptyTimerRef.current = setTimeout(() => {
        setFill(0)
        setPhase(PHASE.IDLE)
      }, EMPTY_HOLD_MS)
    }
  }, [fill, incrementPour])

  const repour = () => {
    clearTimeout(emptyTimerRef.current)
    setFill(0)
    setPhase(PHASE.IDLE)
  }

  // 포인터: 대기에서 누르면 따르기 시작, 마시기에서 누르면 탭(비우기), 따르기에서 떼면 종료.
  const onPointerDown = (e) => {
    e.preventDefault()
    if (phase === PHASE.IDLE) startPour()
    else if (phase === PHASE.DRINKING) drinkTap()
  }
  const onPointerUp = () => {
    if (phase === PHASE.POURING) endPour()
  }

  const showBottle = phase === PHASE.IDLE || phase === PHASE.POURING
  const showStream = phase === PHASE.POURING
  const showGlass = phase === PHASE.POURING || phase === PHASE.DRINKING || phase === PHASE.EMPTY
  const showAhh = phase === PHASE.EMPTY

  const stageHint =
    phase === PHASE.IDLE
      ? '화면을 누르면 따라져요'
      : phase === PHASE.POURING
        ? '누르는 동안 차오름'
        : phase === PHASE.DRINKING
          ? '탭해서 비우기'
          : '잔을 비웠어요'

  const stageTitle =
    phase === PHASE.IDLE
      ? '길게 눌러 따르기'
      : phase === PHASE.DRINKING
        ? '탭해서 비우기'
        : ''

  return (
    <div className="screen">
      <AppHeader title={drink.label ?? '음주 인터랙션'} />
      <div className="screen-body center">
        <div
          className="pour-stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
          onContextMenu={(e) => e.preventDefault()}
          role="button"
          aria-label={stageTitle || '음주 인터랙션'}
        >
          {/* 병 (대기·따르기) */}
          <div className={`pour-el bottle ${showBottle ? '' : 'is-hidden'} ${phase === PHASE.POURING ? 'tilt' : ''}`} />
          {/* 술줄기 (따르기) */}
          <div className={`pour-el stream ${showStream ? '' : 'is-hidden'}`} style={{ background: `linear-gradient(180deg, ${c0}, ${c1})` }} />
          {/* 잔 + 액체 */}
          <div className={`pour-el glass-wrap ${showGlass ? '' : 'is-hidden'}`}>
            <div className="glass-shape">
              <div
                className="glass-liquid"
                style={{ height: `${fill}%`, background: `linear-gradient(180deg, ${c0}, ${c1})` }}
              />
            </div>
            {showAhh && <div className="speech">캬~</div>}
          </div>
        </div>

        {/* 시각 피드백(다중 감각·접근성): 진동/사운드를 꺼도 상태·수위를 화면으로 인지 가능 */}
        <div className="pour-readout" aria-live="polite">
          {stageTitle && <div className="big">{stageTitle}</div>}
          <div className="hint">{stageHint} · {Math.round(fill)}%</div>
        </div>

        {phase === PHASE.DRINKING && (
          <button className="btn ghost" onClick={repour}>다시 따르기</button>
        )}

        {/* 분기·보조 동선 */}
        <div className="nav-row">
          {drink.celebrate && (
            <button className="btn ghost" onClick={() => navigate('/celebrate')}>샴페인 축하</button>
          )}
          <button className="btn ghost" onClick={() => navigate('/cheers')}>건배하기</button>
          <button className="btn ghost" onClick={() => navigate('/record')}>나의 기록</button>
          <button className="btn ghost" onClick={() => navigate('/settings')}>설정</button>
        </div>
      </div>
    </div>
  )
}
