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
import { DRINK_MAP, MODE_MAP } from '../data/presets.js'

// 채움 타이밍(프로토타입 방식). // ASSUMPTION: 임의값 — 검수·튜닝 단계 조정.
const FILL_DURATION = 5000 // 0→100% 도달(ms)
const FILL_INTERVAL = 50
const TAP_DECREASE = 25 // 탭당 감소(%) → 4탭에 비움
const LONGPRESS_MS = 500 // 길게 누르기 인식
const EMPTY_HOLD_MS = 2000 // 빈잔 오버레이 노출 후 대기 복귀

// 종류별 액체 색(프로토타입 방식). // ASSUMPTION: 색감은 임의값.
const LIQUID = {
  soju: 'rgba(200,230,255,0.78)',
  beer: 'rgba(220,150,40,0.9)',
  wine: 'rgba(150,20,50,0.88)',
  makgeolli: 'rgba(235,228,210,0.94)',
  champagne: 'rgba(242,216,154,0.9)',
}

export default function PourInteraction() {
  const navigate = useNavigate()
  const drinkKey = useAppStore((s) => s.drink) ?? 'soju'
  const mode = useAppStore((s) => s.mode)
  const drink = DRINK_MAP[drinkKey] ?? DRINK_MAP.soju
  const liquidColor = LIQUID[drinkKey] ?? `linear-gradient(180deg, ${drink.colors[0]}, ${drink.colors[1]})`
  // 점도(종류는 동일 5s) × 모드 속도 배수 유지(F-MD-02/03).
  const fillDuration = FILL_DURATION * (MODE_MAP[mode]?.speed ?? 1)
  const fillPerTick = 100 / (fillDuration / FILL_INTERVAL)

  const [phase, setPhase] = useState('idle') // idle | pour | drink
  const [fillPct, setFillPct] = useState(0)
  const [isPressing, setIsPressing] = useState(false)
  const [kyaVisible, setKyaVisible] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)
  const [tapLeft, setTapLeft] = useState(4)

  const fillRef = useRef(0)
  const tapRef = useRef(4)
  const pressTimer = useRef(null)
  const fillTimer = useRef(null)
  const emptyTimer = useRef(null)

  // 병 기울기: 0%→20deg, 100%→60deg (시계 방향).
  //   최대 60°에서 병 입구가 고정 술줄기(.pour-stream) 윗점과 만나도록 병·줄기 좌표를 맞춤(global.css 주석 참고).
  const bottleDeg = 20 + (fillPct / 100) * 40

  const stopFilling = useCallback(() => {
    setIsPressing(false)
    clearInterval(fillTimer.current)
    fillTimer.current = null
    stopPourSound()
  }, [])

  const startFilling = useCallback(() => {
    if (fillTimer.current) return
    setIsPressing(true)
    startPourSound(drink.sound) // 소주·맥주 사운드, 나머지 무음(시각 피드백 유지) — 설정·무음 종속(F-SY)
    haptic('light')
    fillTimer.current = setInterval(() => {
      fillRef.current = Math.min(100, fillRef.current + fillPerTick)
      setFillPct(fillRef.current)
      if (fillRef.current >= 100) {
        stopFilling()
        setTimeout(() => setPhase('drink'), 300) // 가득 차면 마시기로(넘침 없음)
      }
    }, FILL_INTERVAL)
  }, [drink.sound, fillPerTick, stopFilling])

  const onPressStart = useCallback(() => {
    if (phase !== 'idle') return
    pressTimer.current = setTimeout(() => {
      setPhase('pour')
      startFilling()
    }, LONGPRESS_MS)
  }, [phase, startFilling])

  const onPressEnd = useCallback(() => {
    clearTimeout(pressTimer.current)
    if (phase === 'pour') stopFilling()
  }, [phase, stopFilling])

  const onTapGlass = useCallback(() => {
    if (phase !== 'drink') return
    playSound('gulp')
    haptic('medium')
    const newTap = Math.max(0, tapRef.current - 1)
    tapRef.current = newTap
    setTapLeft(newTap)
    fillRef.current = Math.max(0, fillRef.current - TAP_DECREASE)
    setFillPct(fillRef.current)

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

  // 언마운트 정리 — 누수 방지(비기능: 반복 전환 시 누수 없음).
  useEffect(() => () => {
    clearTimeout(pressTimer.current)
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
            aria-label="길게 눌러 따르기"
            onMouseDown={onPressStart} onMouseUp={onPressEnd} onMouseLeave={onPressEnd}
            onTouchStart={onPressStart} onTouchEnd={onPressEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="idle-bottle-box">
              {drink.bottle
                ? <img src={drink.bottle} alt={drink.label} draggable={false} style={{ width: 100, height: 220, objectFit: 'contain' }} />
                : <div className="bottle" style={{ position: 'static' }} />}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>길게 눌러 따르기</div>
            <div className="hint" style={{ marginBottom: 28 }}>화면을 누르면 따라져요</div>
            <div className="lp-chip">Long Press</div>
          </div>
        )}

        {/* ── 따르는 중 ── */}
        {phase === 'pour' && (
          <div className="pour-active">
            {/* 병 — 기울기 20→60deg */}
            <img
              src={drink.bottle} alt={drink.label} draggable={false}
              className="pour-bottle"
              style={{ transform: `rotate(${bottleDeg.toFixed(1)}deg)` }}
            />
            {/* 술줄기 */}
            {isPressing && (
              <div className="pour-stream" style={{ height: Math.min(240, 60 + fillPct * 1.8), background: `linear-gradient(to bottom, ${liquidColor}, rgba(255,255,255,.08))` }} />
            )}
            {/* 잔 + 액체(보울 영역 안에서만 차오름) */}
            <Glass className="glass-pour" drink={drink} level={fillPct} height={160} liquidColor={liquidColor} />
            {/* % 배지 */}
            <div className="fill-badge">{Math.round(fillPct)}%</div>
            {/* 누르기 버튼(홀드로 채움) */}
            <button
              className="hold-btn"
              aria-label="누르기"
              onMouseDown={startFilling} onMouseUp={stopFilling} onMouseLeave={stopFilling}
              onTouchStart={(e) => { e.preventDefault(); startFilling() }}
              onTouchEnd={(e) => { e.preventDefault(); stopFilling() }}
            >누르기</button>
            <div className="pour-cap">누르는 동안 차오름</div>
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
          <button className="btn ghost" onClick={() => navigate('/cheers')} style={{ height: 40, fontSize: 13 }}>건배하기</button>
          <button className="btn ghost" onClick={() => navigate('/settings')} style={{ height: 40, fontSize: 13 }}>설정</button>
        </div>
      )}
    </div>
  )
}
