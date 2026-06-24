import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Granite(web.commands.build = "vite build")가 사용하는 Vite 설정.
// base 미지정(절대경로 /assets/...) — 앱인토스 WebView 는 루트 서빙 기준이라
// 기존 base:'./'(상대경로)는 제거했다(검증: dist/web/index.html 절대경로로 정상 동작).
export default defineConfig({
  plugins: [react()],
  // 앱인토스 SDK는 lib/share.js 에서 동적 import 한다. 미리 번들하지 않으면 첫 호출 때
  // Vite 가 의존성을 뒤늦게 발견해 재최적화+강제 리로드 → 샌드박스 WebView 연결이 끊긴다.
  // 미리 포함시켜 dev 기동 시 1회 번들(런타임 중 갑작스런 리로드 방지).
  optimizeDeps: {
    include: ["@apps-in-toss/web-framework"],
  },
});
