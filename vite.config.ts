import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    cssMinify: false
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      // 顶栏天气：腾讯天气接口无 CORS，经开发代理转发
      '/qq-weather': {
        target: 'https://wis.qq.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/qq-weather/, '/weather/common')
      },
      // 顶栏定位：ip-api（自带 CORS，代理用于 https 部署时避免混合内容）
      '/ip-api': {
        target: 'http://ip-api.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/ip-api/, '')
      }
    }
  }
});
