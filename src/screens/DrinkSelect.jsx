// S-03 술 선택 — F-CR-01(5종, 종류별 색·점도 차등 / 브랜드 실명·로고 금지 / 샴페인 축하 배지).
// 골격→확장: 프리셋 기반 카드. 색·점도(차오름 속도)만 차등하고 따르기/마시기 엔진은 공통.
// // REVIEW(에셋 일관성): 도형·색은 CSS 플레이스홀더. 5종 일러스트 일관성은 에셋 단계 검수.
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { DRINKS } from '../data/presets.js'

export default function DrinkSelect() {
  const navigate = useNavigate()
  const setDrink = useAppStore((s) => s.setDrink)

  const pick = (key) => {
    setDrink(key)
    navigate('/pour')
  }

  return (
    <div className="screen">
      <AppHeader title="무엇을 따라볼까요" />
      <div className="screen-body">
        <div className="drink-grid">
          {DRINKS.map((d) => (
            <button key={d.key} className="drink-card" onClick={() => pick(d.key)}>
              {d.celebrate && <span className="badge">축하 연출</span>}
              {/* 잔 이미지 보유 종류는 실제 잔 썸네일, 없으면 CSS 색 스와치 폴백(샴페인). F-CR-01. */}
              {d.glass ? (
                <img className="drink-thumb" src={d.glass} alt="" draggable={false} />
              ) : (
                <span className="drink-swatch">
                  <span className="swatch-liquid" style={{ background: `linear-gradient(180deg, ${d.colors[0]}, ${d.colors[1]})` }} />
                  {d.foam && <span className="swatch-foam" />}
                </span>
              )}
              <span className="drink-name">{d.label}</span>
              <span className="drink-visc">점도 {d.viscosity}</span>
            </button>
          ))}
        </div>
        <p className="hint center">종류별로 병·잔·색·소리·점도가 달라요</p>
      </div>
    </div>
  )
}
