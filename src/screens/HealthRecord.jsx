// S-08 건강 기록 — F-HL-01(누적 잔 수 단순 표시) · F-HL-02(아낀 술값·칼로리 환산).
// 비게임(context §6): 목표·레벨·랭킹·배지 없음. 단순 카운트 + 잔당 고정값 곱셈만.
// // ASSUMPTION: 환산 계수는 presets.js의 임의 대표값(출처 표기). 검수 시 실제 기준 확정.
// // REVIEW(음주 톤): "비운 잔" vs context §1 "안 마신 횟수" 라벨 프레임 불일치 — 노출 문구 검수 대상(STEP1 ⚠️1).
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { savedWon, savedKcal } from '../lib/health.js'

export default function HealthRecord() {
  const pourCount = useAppStore((s) => s.record.pourCount)
  const resetRecord = useAppStore((s) => s.resetRecord)

  const won = savedWon(pourCount)
  const kcal = savedKcal(pourCount)

  return (
    <div className="screen">
      <AppHeader title="나의 기록" />
      <div className="screen-body center">
        <div className="record-cap hint">지금까지 폰술로 비운 잔</div>
        <div className="bignum">{pourCount}<span className="unit">잔</span></div>
        <div className="stat-row">
          <div className="stat">
            <div className="stat-v">₩{won.toLocaleString('ko-KR')}</div>
            <div className="stat-k">아낀 술값</div>
          </div>
          <div className="stat">
            <div className="stat-v">{kcal.toLocaleString('ko-KR')} kcal</div>
            <div className="stat-k">아낀 칼로리</div>
          </div>
        </div>
        <p className="hint">잔당 고정값 기준 단순 환산 (목표·랭킹 없음)</p>
        {/* 테스트 편의: 누적 초기화 (검수용, 비게임 — 보상 아님) */}
        <button className="btn ghost" onClick={resetRecord}>기록 초기화</button>
      </div>
    </div>
  )
}
