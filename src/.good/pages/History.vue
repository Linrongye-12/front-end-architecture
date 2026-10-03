<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, listFrom } from '../api';
const records = ref<any[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.planting.history({ page: 1, size: 20 });
    records.value = listFrom(res);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
<template>
  <div class="history-page">
    <h2>历史预测记录</h2>
    <div v-if="loading">加载中...</div>
    <table v-else-if="records.length">
      <thead>
        <tr><th>ID</th><th>作物</th><th>预测时间</th><th>状态</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in records" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.cropName || '-' }}</td>
          <td>{{ r.createdAt || '-' }}</td>
          <td>{{ r.status || '-' }}</td>
          <td><RouterLink :to="`/report/${r.id}`">查看报告</RouterLink></td>
        </tr>
      </tbody>
    </table>
    <p v-else>暂无历史记录</p>
  </div>
</template>
