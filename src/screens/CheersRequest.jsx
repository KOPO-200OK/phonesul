// S-06 건배 요청 — F-CH-01(getTossShareLink로 링크 생성) · F-CH-02(share 공유 시트).
// 골격: 화면·버튼만. 링크 생성/공유 SDK 호출은 후속 단계.
//   // UNVERIFIED: getTossShareLink / share 실제 동작 — 앱인토스 SDK(MCP/공식문서) 확인 필요.
import AppHeader from '../components/AppHeader.jsx'

export default function CheersRequest() {
  return (
    <div className="screen">
      <AppHeader title="건배하기" />
      <div className="screen-body center">
        <div className="stage-placeholder">멀리 있는 친구와 짠</div>
        <p className="hint">링크를 보내면, 친구가 열 때 양쪽에서 ‘짠’</p>
        {/* TODO(S2 구현): getTossShareLink → share */}
        <button className="btn primary" disabled>건배 링크 만들기 (골격)</button>
      </div>
    </div>
  )
}
