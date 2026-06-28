// S-09 종료 확인 모달(공통 오버레이) — F-SY-05. (v0.2: 화면 재정렬로 S-09)
// '종료' → 토스 WebView는 closeView()로 미니앱 종료. 비-토스(데스크톱/브라우저)는 종료 API가
//   없으므로 스플래시(S-01) 복귀로 대체해 처음부터 재시작.
// // UNVERIFIED: 실기기 토스 WebView에서 closeView 실제 종료 동작 — 샌드박스 확인.
import { useNavigate } from 'react-router-dom'
import { stopBgm } from '../lib/audioPolicy.js'
import { closeMiniApp } from '../lib/platform.js'

export default function ExitModal({ open, onClose }) {
  const navigate = useNavigate()
  if (!open) return null

  const onExit = async () => {
    stopBgm() // 경험 종료 → BGM 정지
    const closed = await closeMiniApp() // 토스 WebView: 실제 미니앱 종료
    if (!closed) {
      // 비-토스: 종료 API 없음 → 스플래시 복귀로 대체
      onClose()
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="종료 확인">
      <div className="modal-dialog">
        <div className="modal-q">폰술을 종료할까요?</div>
        <div className="modal-sub">언제든 다시 따라줄게요</div>
        <div className="modal-btns">
          <button className="btn ghost" onClick={onClose}>취소</button>
          <button className="btn amber" onClick={onExit}>종료</button>
        </div>
      </div>
    </div>
  )
}
