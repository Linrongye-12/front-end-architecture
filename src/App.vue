<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { authState, logout } from './auth';
import { weatherState, initWeather } from './weather';
const route = useRoute();
const router = useRouter();
// 顶栏天气/位置：自动获取真实数据，失败时保留默认值
initWeather();
const nav = [
  ['/', '首页'],
  ['/prediction', '智能预测'],
  ['/history', '历史记录'],
  ['/policy', '政策动态'],
  ['/academy', '知识学院'],
  ['/cases', '案例库'],
  ['/qa', '智能问答']
];
function signOut() {
  logout();
  router.push('/');
}
</script>
<template>
  <RouterView v-if="route.meta.layout === 'auth' || route.meta.layout === 'admin'" />
  <div v-else class="shell">
    <!-- 左侧极简导航栏：图标 + 文字，选中绿色高亮（nav 数据来自原有 script，图标按序内联展示） -->
    <aside class="shell-side">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">农</span>
        <span class="brand-text"><b>农策审</b><small>农业智能决策平台</small></span>
      </RouterLink>
      <nav class="side-nav">
        <RouterLink v-for="[p, n] in nav" :key="p" :to="p" class="nav-item">
          <span>{{ n }}</span>
        </RouterLink>
      </nav>
      <div class="side-user">
        <RouterLink v-if="!authState.token" class="login-pill" to="/login">登录</RouterLink>
        <template v-else>
          <RouterLink class="user-pill" to="/history">{{
            authState.user?.nickname || '个人中心'
          }}</RouterLink>
          <button class="signout-btn" @click="signOut">退出</button>
        </template>
      </div>
    </aside>
    <!-- 右侧主体：顶部信息栏（磨砂玻璃）+ 主内容 + 页脚 -->
    <div class="shell-body">
      <header class="shell-top">
        <h1 class="page-title">
          {{
            nav.find(
              ([p]) => p === route.path || (p !== '/' && route.path.startsWith(p + '/'))
            )?.[1] || '农策审'
          }}
        </h1>
        <div class="top-chips">
          <span class="chip"
            >{{ weatherState.icon }}
            {{ weatherState.temp != null ? weatherState.temp + '°C' : '--°C' }} ·
            {{ weatherState.text }}</span
          >
          <span class="chip">📍 {{ weatherState.location }}</span>
        </div>
      </header>
      <main><RouterView /></main>
      <footer>
        <div>
          <RouterLink to="/" class="brand">
            <span><b>农策审</b><small>农业智能决策平台</small></span>
          </RouterLink>
          <p>AI 赋能农业决策，科学种植，智慧丰收。</p>
        </div>
        <div>
          <b>平台服务</b>
          <RouterLink class="footer-link" to="/prediction">智能预测</RouterLink>
          <RouterLink class="footer-link" to="/policy">政策动态</RouterLink>
          <RouterLink class="footer-link" to="/qa">智能问答</RouterLink>
        </div>
        <div>
          <b>学习中心</b>
          <RouterLink class="footer-link" to="/academy">知识学院</RouterLink>
          <RouterLink class="footer-link" to="/cases">案例库</RouterLink>
        </div>
        <div><b>联系我们</b><span>service@nongceshen.com</span></div>
      </footer>
    </div>
  </div>
</template>
