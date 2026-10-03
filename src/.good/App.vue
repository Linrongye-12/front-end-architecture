<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { authState, logout } from './auth';
const route = useRoute();
const router = useRouter();
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
        <RouterLink v-for="([p, n]) in nav" :key="p" :to="p" class="nav-item">
          <span>{{ n }}</span>
        </RouterLink>
      </nav>
      <div class="side-user">
        <RouterLink v-if="!authState.token" class="login-pill" to="/login">登录</RouterLink>
        <template v-else>
          <RouterLink class="user-pill" to="/history">{{ authState.user?.nickname || '个人中心' }}</RouterLink>
          <button class="signout-btn" @click="signOut">退出</button>
        </template>
      </div>
    </aside>
    <!-- 右侧主体：顶部信息栏（磨砂玻璃）+ 主内容 + 页脚 -->
    <div class="shell-body">
      <header class="shell-top">
        <h1 class="page-title">{{
          nav.find(([p]) => p === route.path || (p !== '/' && route.path.startsWith(p + '/')))?.[1] || '农策审'
        }}</h1>
        <div class="top-chips">
          <span class="chip">🌤️ 26°C · 晴</span>
          <span class="chip">📍 山东 · 寿光</span>
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
        <div><b>平台服务</b><span>智能预测</span><span>种植分析</span><span>决策建议</span></div>
        <div><b>学习中心</b><span>知识库</span><span>帮助中心</span></div>
        <div>
          <b>联系我们</b><span>service@nongceshen.com</span>
        </div>
      </footer>
    </div>
  </div>
</template>
