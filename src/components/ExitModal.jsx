// S-10 종료 확인 모달(공통 오버레이) — F-SY-05.
// 골격: 노출/취소만. '종료' 선택 시 실제 앱 종료(앱인토스)는 후속 단계 연결.
// // UNVERIFIED: 앱인토스 WebView에서의 앱 종료 호출 방식 미확인(SDK/공식문서 확인 필요).
export default function ExitModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="종료 확인">
      <div className="modal-dialog">
        <div className="modal-q">폰술을 종료할까요?</div>
        <div className="modal-sub">언제든 다시 따라줄게요</div>
        <div className="modal-btns">
          <button className="btn ghost" onClick={onClose}>취소</button>
          {/* TODO(S2 구현): 앱인토스 종료 호출 연결 */}
          <button className="btn primary" onClick={onClose}>종료</button>
        </div>
      </div>
    </div>
  )
}
