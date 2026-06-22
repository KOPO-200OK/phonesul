// 공통 헤더 — 좌측 뒤로/홈, 가운데 화면명, 우측 상단 닫기(X).
// 화면설계서 §04 공통 UI 규칙: 닫기(X) 상시 노출, 닫기 → 종료 확인 모달(S-09).
// 골격: 레이아웃·트리거 연결만. 뒤로가기 로직은 후속 단계.
//   F-SY-06(닫기 버튼) → F-SY-05(종료 확인 모달)
import { useNavigate } from 'react-router-dom'
import { useExitModal } from './exitModalContext.js'

export default function AppHeader({ title, showBack = true }) {
  const navigate = useNavigate()
  const { openExit } = useExitModal()

  return (
    <header className="app-header">
      <button
        className="hdr-btn back"
        aria-label="뒤로"
        style={{ visibility: showBack ? 'visible' : 'hidden' }}
        onClick={() => navigate(-1)}
      >
        ‹
      </button>
      <span className="hdr-title">{title}</span>
      <button className="hdr-btn close" aria-label="닫기" onClick={openExit}>
        ✕
      </button>
    </header>
  )
}
