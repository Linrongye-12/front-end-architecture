<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, listFrom } from '../../api';
const logs = ref<any[]>([]);
onMounted(async () => {
  try { logs.value = listFrom(await api.admin.agentLogs({ page: 1, size: 20 })); } catch {}
});
</script>
<template>
  <div class="admin-agent-logs">
    <h2>Agent 调用日志</h2>
    <table v-if="logs.length">
      <thead><tr><th>ID</th><th>任务类型</th><th>状态</th><th>耗时</th><th>时间</th></tr></thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ log.id }}</td><td>{{ log.taskType || '-' }}</td>
          <td>{{ log.status || '-' }}</td><td>{{ log.duration || '-' }}ms</td>
          <td>{{ log.createdAt || '-' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>暂无日志</p>
  </div>
</template>