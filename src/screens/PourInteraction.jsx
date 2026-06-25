// S-04 음주 인터랙션 — phonesul-react-with-assets_3/Pour.jsx 방식(디자인+작동) 적용.
//   F-CR-02(롱프레스→차오름) · F-CR-03(탭→비움) · F-CR-04(순환). 비게임(context §6): 점수·목표·엔딩 없음.
//   변경: 소주 프레임 시퀀스 제거 → 전 종류 동일하게 잔 이미지 + 액체 채움(높이) 연출.
//   헤더(뒤로/닫기)는 정상 흐름 유지 — 스테이지가 헤더를 덮지 않게 하여 버튼 작동 보장(이전 버그 수정).
//   문구: context §5.1 준수(음주 권장 톤 금지).
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import Glass from '../components/Glass.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { playSound, haptic, startPourSound, stopPourSound } from '../lib/feedback.js'
import { startBgm } from '../lib/audioPolicy.js'
import { DRINK_MAP, MODE_MAP } from '../data/presets.js'

// 채움 타이밍(프로토타입 방식). // ASSUMPTION: 임의값 — 검수·튜닝 단계 조정.
const FILL_DURATION = 5000 // 0→100% 도달(ms)
const FILL_INTERVAL = 50
const STREAM_START_HEIGHT = 36
const STREAM_MAX_HEIGHT = 220
const STREAM_STEP = 28
const STREAM_INTERVAL = 40
const TAP_DECREASE = 25 // 탭당 감소(%) → 4탭에 비움
const EMPTY_HOLD_MS = 2000 // 빈잔 오버레이 노출 후 대기 복귀

export default function PourInteraction() {
  const navigate = useNavigate()
  const drinkKey = useAppStore((s) => s.drink) ?? 'soju'
  const mode = useAppStore((s) => s.mode)
  const drink = DRINK_MAP[drinkKey] ?? DRINK_MAP.soju
  const liquidColor = `linear-gradient(180deg, ${drink.colors[0]}, ${drink.colors[1]})`
  // 점도(종류는 동일 5s) × 모드 속도 배수 유지(F-MD-02/03).
  const fillDuration = FILL_DURATION * (MODE_MAP[mode]?.speed ?? 1)
  const fillPerTick = 100 / (fillDuration / FILL_INTERVAL)

  const [phase, setPhase] = useState('idle') // idle | pour | drink
  const [fillPct, setFillPct] = useState(0)
  const [streamHeight, setStreamHeight] = useState(0)
  const [isPressing, setIsPressing] = useState(false)
  const [kyaVisible, setKyaVisible] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)
  const [tapLeft, setTapLeft] = useState(4)

  const fillRef = useRef(0)
  const streamRef = useRef(0)
  const tapRef = useRef(4)
  const fillTimer = useRef(null)
  const streamTimer = useRef(null)
  const emptyTimer = useRef(null)
  const pourStreamRef = useRef(null)
  const glassWrapRef = useRef(null)
  const targetStreamRef = useRef(null)

  const showPourScreen = phase === 'pour' || (phase !== 'drink' && fillPct > 0) || streamHeight > 0

  // 병 기울기: 0%→20deg, 100%→60deg (시계 방향).
  //   최대 60°에서 병 입구가 고정 술줄기(.pour-stream) 윗점과 만나도록 병·줄기 좌표를 맞춤(global.css 주석 참고).
  const BOTTLE_START_DEG = 45
  const BOTTLE_EXTRA_DEG = 15

  const bottleDeg = BOTTLE_START_DEG + (fillPct / 100) * BOTTLE_EXTRA_DEG
  const glassStyle = drinkKey === 'beer' ? { left: '52%', transform: 'translateX(-42%)' } : undefined

  const stopFilling = useCallback(() => {
    setIsPressing(false)
    clearInterval(fillTimer.current)
    fillTimer.current = null
    stopPourSound()
  }, [])

  const stopStream = useCallback(() => {
    clearInterval(streamTimer.current)
    streamTimer.current = null
  }, [])

  const startFilling = useCallback(() => {
    if (fillTimer.current) {
      clearInterval(fillTimer.current)
      fillTimer.current = null
    }
    if (streamTimer.current) {
      clearInterval(streamTimer.current)
      streamTimer.current = null
    }
    setIsPressing(true)
    setPhase('pour')
    startPourSound(drink.sound)
    // start with a short stream
    streamRef.current = STREAM_START_HEIGHT
    setStreamHeight(STREAM_START_HEIGHT)

    // measure DOM positions after paint to compute exact target height
    requestAnimationFrame(() => {
      try {
        const pourEl = pourStreamRef.current
        const glassEl = glassWrapRef.current
        if (pourEl && glassEl) {
          const pourRect = pourEl.getBoundingClientRect()
          const svgRect = glassEl.querySelector('.glass-fill-svg rect')?.getBoundingClientRect()
          const fillElRect = svgRect || glassEl.querySelector('.glass-fill-liquid')?.getBoundingClientRect()
          if (fillElRect) {
            const target = Math.max(STREAM_START_HEIGHT, Math.round(fillElRect.top - pourRect.top))
            targetStreamRef.current = Math.min(STREAM_MAX_HEIGHT, target)
          } else {
            targetStreamRef.current = STREAM_MAX_HEIGHT
          }
        } else {
          targetStreamRef.current = STREAM_MAX_HEIGHT
        }
      } catch (e) {
        targetStreamRef.current = STREAM_MAX_HEIGHT
      }

      // animate stream to the measured target faster than fill speed
      if (streamTimer.current) {
        clearInterval(streamTimer.current)
        streamTimer.current = null
      }
      streamTimer.current = setInterval(() => {
        const tgt = targetStreamRef.current ?? STREAM_MAX_HEIGHT
        if (streamRef.current < tgt) {
          streamRef.current = Math.min(tgt, streamRef.current + STREAM_STEP)
          setStreamHeight(streamRef.current)
        } else {
          clearInterval(streamTimer.current)
          streamTimer.current = null
        }
      }, STREAM_INTERVAL)
    })

    // fill the glass at normal rate
    fillTimer.current = setInterval(() => {
      fillRef.current = Math.min(100, fillRef.current + fillPerTick)
      setFillPct(fillRef.current)
      if (fillRef.current >= 100) {
        stopFilling()
        stopStream()
        setStreamHeight(0)
        haptic('strong') // 잔 100% 충전 완료 시 진동(강하게)
        setPhase('drink')
      }
    }, FILL_INTERVAL)
  }, [drink.sound, fillPerTick, stopFilling, stopStream])

  const startRetracting = useCallback(() => {
    if (streamTimer.current) {
      clearInterval(streamTimer.current)
      streamTimer.current = null
    }
    setIsPressing(false)
    // retract the stream smoothly back to 0 while preserving fillPct
    streamTimer.current = setInterval(() => {
      streamRef.current = Math.max(0, streamRef.current - Math.max(8, Math.round(STREAM_STEP / 2)))
      setStreamHeight(streamRef.current)
      if (streamRef.current <= 0) {
        stopStream()
        if (fillRef.current <= 0) {
          setPhase('idle')
        }
      }
    }, STREAM_INTERVAL)
  }, [stopStream])

  const onPressStart = useCallback(() => {
    if (phase === 'drink') return
    startFilling()
  }, [phase, startFilling])

  const onPressEnd = useCallback(() => {
    if (phase === 'pour' && isPressing) {
      stopFilling()
      startRetracting()
    }
  }, [phase, isPressing, startRetracting, stopFilling])

  const onTapGlass = useCallback(() => {
    if (phase !== 'drink') return
    playSound('gulp')
    const newTap = Math.max(0, tapRef.current - 1)
    tapRef.current = newTap
    setTapLeft(newTap)
    
    // 액체가 부드럽게 줄어들도록 감소 단계를 세분화.
    const decaySteps = 8
    const decayPerStep = TAP_DECREASE / decaySteps
    let stepCount = 0
    const decayInterval = setInterval(() => {
      stepCount++
      fillRef.current = Math.max(0, fillRef.current - decayPerStep)
      setFillPct(fillRef.current)
      if (stepCount >= decaySteps || fillRef.current <= 0) {
        clearInterval(decayInterval)
      }
    }, 30)

    if (newTap === 0) {
      // 비움 완료 → "캬~" → 빈잔 오버레이 → 대기 복귀. (누적 기록 없음 — F-HL 제거)
      playSound('ahh')
      setKyaVisible(true)
      setTimeout(() => {
        setShowEmpty(true)
        emptyTimer.current = setTimeout(resetToIdle, EMPTY_HOLD_MS)
      }, 400)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const resetToIdle = useCallback(() => {
    stopFilling()
    clearTimeout(emptyTimer.current)
    fillRef.current = 0
    tapRef.current = 4
    setFillPct(0)
    setTapLeft(4)
    setKyaVisible(false)
    setShowEmpty(false)
    setPhase('idle')
  }, [stopFilling])

  // 모드별 BGM 시작(혼술=잔잔 / 술자리=신나는). 사운드 설정·무음/백그라운드 정책은 audioPolicy가 처리.
  //   언마운트해도 멈추지 않음(건배·축하 화면까지 이어짐). 정지는 종료/백그라운드/사운드 Off에서.
  useEffect(() => { startBgm(mode) }, [mode])

  // 누르고 있다가 해제하면 반드시 채움 중지.
  useEffect(() => {
    if (!isPressing) return undefined

    const handleRelease = () => {
      if (phase === 'pour') {
        stopFilling()
        startRetracting()
      }
    }

    window.addEventListener('pointerup', handleRelease)
    window.addEventListener('pointercancel', handleRelease)
    return () => {
      window.removeEventListener('pointerup', handleRelease)
      window.removeEventListener('pointercancel', handleRelease)
    }
  }, [isPressing, phase, startRetracting, stopFilling])

  // 언마운트 정리 — 누수 방지(비기능: 반복 전환 시 누수 없음).
  useEffect(() => () => {
    clearInterval(fillTimer.current)
    clearTimeout(emptyTimer.current)
    stopPourSound()
  }, [])

  return (
    <div className="screen">
      <AppHeader title={drink.label ?? '음주 인터랙션'} />

      {/* 인터랙션 영역(헤더 아래만 차지 — 헤더 버튼을 덮지 않음) */}
      <div className="pour-area">

        {/* ── 대기 ── */}
        {phase === 'idle' && (
          <div
            className="pour-idle"
            role="button"
            aria-label="누르고 따르기"
            onPointerDown={onPressStart}
            onPointerUp={onPressEnd}
            onPointerLeave={onPressEnd}
            onPointerCancel={onPressEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="idle-bottle-box">
              {drink.bottle
                ? <img src={drink.bottle} alt={drink.label} draggable={false} style={{ width: 100, height: 220, objectFit: 'contain', transform: `scale(${drink.bottleScale ?? 1})` }} />
                : <div className="bottle" style={{ position: 'static' }} />}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>누르고 따르기</div>
            <div className="hint" style={{ marginBottom: 28 }}>화면을 누르면 따라져요</div>
            <div className="lp-chip">Press and hold</div>
          </div>
        )}

        {/* ── 따르는/되돌아가는 중 ── */}
        {showPourScreen && (
          <div
            className="pour-active"
            role="button"
            aria-label="화면을 누르고 따르기"
            onPointerDown={startFilling}
            onPointerUp={onPressEnd}
            onPointerLeave={onPressEnd}
            onPointerCancel={onPressEnd}
          >
            {/* 병 — 기울기 20→60deg. 따르는 중엔 뚜껑 열린 병 사용. */}
            <img
              src={drink.bottleOpen ?? drink.bottle} alt={drink.label} draggable={false}
              className="pour-bottle"
              style={{ transform: `rotate(${bottleDeg.toFixed(1)}deg) scale(${drink.bottleScale ?? 1})` }}
            />
            {/* 술줄기 */}
            <div
              className="pour-stream"
              ref={pourStreamRef}
              style={{
                height: streamHeight,
                background: `linear-gradient(to bottom, ${drink.colors[0]}, ${drink.colors[1]})`,
                opacity: streamHeight > 0 ? 1 : 0,
                width: streamHeight > 0 ? 12 : 0,
              }}
            >
              {streamHeight > 0 && <div className="pour-drop" style={{ background: drink.colors[1] }} />}
            </div>
            {/* 잔 + 액체(보울 영역 안에서만 차오름) */}
            <div className="glass-pour" ref={glassWrapRef} style={glassStyle}>
              <Glass drink={drink} level={fillPct} height={160} liquidColor={liquidColor} />
            </div>
            {/* % 배지 */}
            <div className="fill-badge">{Math.round(fillPct)}%</div>
            {/* 화면 터치로 채움 안내 */}
            <div className="pour-tip" aria-hidden="true">누르는 동안 차오름</div>
          </div>
        )}

        {/* ── 마시기 ── */}
        {phase === 'drink' && (
          <div className="drink-active">
            <div className="drink-glass-tap" role="button" aria-label="탭해서 비우기" onClick={onTapGlass}>
              <div className="drink-glow" />
              <Glass drink={drink} level={fillPct} height={200} liquidColor={liquidColor} />
              {kyaVisible && <div className="speech" style={{ top: -10, right: -24 }}>캬~</div>}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 28 }}>탭해서 비우기</div>
            <div className="hint" style={{ marginTop: 8 }}>남은 탭 {tapLeft}번</div>
            <button className="btn primary btn-bottom" onClick={resetToIdle}>다시 따르기</button>
          </div>
        )}

        {/* ── 빈잔 오버레이 ── */}
        {showEmpty && (
          <div className="empty-overlay">
            <div className="kya">캬~ 🎵</div>
            <div className="sub">마시지 않고도 분위기를 즐겨요</div>
          </div>
        )}
      </div>

      {/* 보조 동선(대기에서만 노출 — 인터랙션 방해 최소화) */}
      {phase === 'idle' && (
        <div className="nav-row" style={{ position: 'absolute', bottom: 20, left: 12, right: 12 }}>
          {drink.celebrate && (
            <button className="btn ghost" onClick={() => navigate('/celebrate')} style={{ height: 40, fontSize: 13 }}>샴페인 축하</button>
          )}
          {/* 건배방은 술자리 모드 전용 — 혼술 모드에선 진입 버튼 미노출 */}
          {mode === 'party' && (
            <button className="btn ghost" onClick={() => navigate('/cheers')} style={{ height: 40, fontSize: 13 }}>건배하기</button>
          )}
          <button className="btn ghost" onClick={() => navigate('/settings')} style={{ height: 40, fontSize: 13 }}>설정</button>
        </div>
      )}
    </div>
  )
}
