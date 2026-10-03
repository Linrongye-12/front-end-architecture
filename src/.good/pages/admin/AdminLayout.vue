<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
const modules = [
  ['/admin/dashboard', '数据总览'],
  ['/admin/users', '用户管理'],
  ['/admin/knowledge', '知识库管理'],
  ['/admin/agent-logs', 'Agent日志'],
  ['/admin/policy', '政策管理'],
  ['/admin/academy', '知识学院管理'],
  ['/admin/cases', '案例库管理'],
  ['/admin/qa', '问答管理'],
  ['/admin/settings', '系统配置']
];
</script>
<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <h3>管理后台</h3>
      <RouterLink v-for="[path, label] in modules" :key="path" :to="path"
        :class="{ active: route.path === path }">{{ label }}</RouterLink>
    </aside>
    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>