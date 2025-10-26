import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './',
  base: '/encrypt/',
  plugins: [react({
    include: [/\.jsx?$/, /\.tsx?$/], // 处理所有js/jsx文件
    babel: {
      presets: ['@babel/preset-react'],
      plugins: [
        ['@babel/plugin-transform-react-jsx', { 
          runtime: 'automatic' 
        }]
      ]
    }
  })],
  build: {
    outDir: 'dist',             // 可选：建议使用 dist，便于部署到 nginx 指定目录
    assetsDir: 'assets'
  }
})
