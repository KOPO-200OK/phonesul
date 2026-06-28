// S-03 술 선택 — F-CR-01(5종, 종류별 색·점도 차등 / 브랜드 실명·로고 금지 / 샴페인 축하 배지).
//   화면 구성: 2×2 병 카드 그리드 + 샴페인 풀위드(축하 연출 배지) — phonesul-react-with-assets_3 룩.
//   // REVIEW(에셋 일관성): 5종 일러스트 일관성은 에셋 단계 검수(context §9·§10).
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { DRINKS } from '../data/presets.js'

export default function DrinkSelect() {
  const navigate = useNavigate()
  const setDrink = useAppStore((s) => s.setDrink)

  const pick = (key, celebrate) => {
    setDrink(key)
    navigate(celebrate ? '/celebrate' : '/pour')
  }

  const grid = DRINKS.filter((d) => !d.celebrate)
  const champagne = DRINKS.find((d) => d.celebrate)

  return (
    <div className="screen">
      <AppHeader title="무엇을 따라볼까요" />
      <div className="screen-body">
        <div className="drink-grid">
          {grid.map((d) => (
            <button key={d.key} className="drink-card" onClick={() => pick(d.key, false)}>
              {d.bottle ? (
                <img className="drink-thumb" src={d.bottle} alt="" draggable={false} style={{ transform: `scale(${d.bottleScale ?? 1})` }} />
              ) : (
                <span className="drink-swatch" style={{ background: `linear-gradient(180deg, ${d.colors[0]}, ${d.colors[1]})`, width: 44, height: 90, borderRadius: 8 }} />
              )}
              <span className="drink-name">{d.label}</span>
            </button>
          ))}
        </div>

        {champagne && (
          <button className="drink-card drink-wide" onClick={() => pick(champagne.key, true)}>
            <span>
              <span className="badge">축하 연출</span>
              <span className="drink-name" style={{ display: 'block' }}>{champagne.label}</span>
            </span>
            {champagne.bottle && <img className="drink-thumb" src={champagne.bottle} alt="" draggable={false} />}
          </button>
        )}

        <p className="hint center" style={{ marginTop: 8 }}>종류별로 병·잔·색·소리·점도가 달라요</p>
      </div>
    </div>
  )
}
