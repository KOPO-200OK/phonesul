import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// S3 테스트 설정. jsdom 환경 + RTL. 성능/SDK/센서는 테스트 범위 밖(실기기 측정 — 마커 참조).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
