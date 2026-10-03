<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, listFrom } from '../../api';
const items = ref<any[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try { items.value = listFrom(await api.admin.knowledge.list({ page: 1, size: 20 })); } catch {}
  finally { loading.value = false; }
});

async function handleDelete(id: number) {
  if (!confirm('确认删除？')) return;
  try { await api.admin.knowledge.remove(id); items.value = items.value.filter(i => i.id !== id); } catch {}
}
</script>
<template>
  <div class="admin-knowledge">
    <h2>知识库管理</h2>
    <div v-if="loading">加载中...</div>
    <table v-else-if="items.length">
      <thead><tr><th>ID</th><th>标题</th><th>分类</th><th>更新时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.id }}</td><td>{{ item.title || '-' }}</td>
          <td>{{ item.category || '-' }}</td><td>{{ item.updatedAt || '-' }}</td>
          <td>
            <button @click="handleDelete(item.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>暂无知识库条目</p>
  </div>
</template>