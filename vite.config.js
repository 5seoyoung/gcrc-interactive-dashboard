import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // 상대 경로로 설정 (GitHub Pages 호환)
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['chart.js', 'leaflet'],
          utils: ['./src/utils/api.js', './src/utils/helpers.js']
        }
      }
    }
  },
  
  define: {
    // 빌드 시 환경변수 주입
    'import.meta.env.VITE_MOCK_MODE': JSON.stringify(process.env.VITE_MOCK_MODE || 'true'),
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '')
  },
  
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  
  preview: {
    port: 4173,
    open: true
  }
})