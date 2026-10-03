<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../api';
const stats = ref<any>(null);
onMounted(async () => {
  try { stats.value = await api.admin.statistics(); } catch {}
});
</script>
<template>
  <div class="admin-dashboard">
    <h2>数据总览</h2>
    <div v-if="stats" class="stat-grid">
      <div class="stat-card"><b>{{ stats.userCount || 0 }}</b><span>用户总数</span></div>
      <div class="stat-card"><b>{{ stats.predictionCount || 0 }}</b><span>预测次数</span></div>
      <div class="stat-card"><b>{{ stats.knowledgeCount || 0 }}</b><span>知识库条目</span></div>
      <div class="stat-card"><b>{{ stats.todayActive || 0 }}</b><span>今日活跃</span></div>
    </div>
    <p v-else>加载中...</p>
  </div>
</template>