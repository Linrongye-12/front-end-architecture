<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../api';
const params = ref<any>({});
onMounted(async () => {
  try { params.value = await api.admin.systemParams.get(); } catch {}
});
async function handleSave() {
  try { await api.admin.systemParams.update(params.value); alert('保存成功'); } catch {}
}
</script>
<template>
  <div class="admin-settings">
    <h2>系统配置</h2>
    <div class="form-group">
      <label>Agent API 地址</label>
      <input v-model="params.agentApiUrl" placeholder="https://agent.example.com/api" />
    </div>
    <div class="form-group">
      <label>模型名称</label>
      <input v-model="params.modelName" placeholder="默认模型" />
    </div>
    <button @click="handleSave">保存配置</button>
  </div>
</template>