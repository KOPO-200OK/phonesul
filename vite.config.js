import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// context §4: WebView(React 18 + Vite) / CSR / 백엔드 없음.
// base: './' — 정적 배포 시 상대 경로 에셋. 앱인토스 배포 경로 규칙은 후속 단계 확인 대상.
// // UNVERIFIED: 앱인토스 빌드/배포 base 경로·산출물 규칙은 MCP(ax)/공식문서로 확정 필요.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true,
  },
})
