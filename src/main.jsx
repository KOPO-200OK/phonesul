// 폰술(가칭) 진입점 — S2 골격 단계.
// 이 파일은 React 18 CSR 부트만 담당한다. SDK 호출 코드 없음(STEP 2 범위).
//
// 골격 한정 안내:
// - 앱인토스 SDK(Storage/share/getTossShareLink/getAnonymousKey/generateHapticFeedback)
//   연동은 후속 단계에서 추가한다. 지금은 폴더·라우팅·상태관리 골격만.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
