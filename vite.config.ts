import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 상대 경로로 빌드 — Netlify, GitHub Pages(아이디.github.io/저장소/) 어디에 올려도 동작한다
  base: './',
  // 포트를 여기서 고정한다 — dev.bat, VS Code 모두 `npm run dev` 만 부르면 된다
  server: { port: 5174, strictPort: true },
})
