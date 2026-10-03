<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, listFrom } from '../../api';
const users = ref<any[]>([]);
onMounted(async () => {
  try { users.value = listFrom(await api.admin.users.list({ page: 1, size: 20 })); } catch {}
});
</script>
<template>
  <div class="admin-users">
    <h2>用户管理</h2>
    <table v-if="users.length">
      <thead><tr><th>ID</th><th>昵称</th><th>手机号</th><th>注册时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td><td>{{ u.nickname || '-' }}</td>
          <td>{{ u.phone || '-' }}</td><td>{{ u.createdAt || '-' }}</td>
          <td><button @click="api.admin.users.detail(u.id)">详情</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else>暂无用户数据</p>
  </div>
</template>