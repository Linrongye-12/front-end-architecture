<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../api';
import { errMessage } from '../api'; // 新增：统一错误提示
const file = ref<File | null>(null);
const loading = ref(false);
const result = ref<any>(null);
const error = ref(''); // 新增：预测失败提示

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.[0]) file.value = input.files[0];
}

async function handlePredict() {
  if (!file.value) return;
  loading.value = true;
  result.value = null;
  error.value = ''; // 新增
  try {
    const formData = new FormData();
    formData.append('file', file.value);
    await api.planting.uploadDoc(formData);
    // 提交后查询结果
    const res = await api.planting.queryResult({});
    result.value = res;
  } catch (err) {
    console.error(err);
    error.value = errMessage(err); // 新增
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div class="prediction-page">
    <h2>智能预测</h2>
    <p>上传种植记录文档，AI 将分析并给出种植建议</p>
    <div class="upload-area">
      <input type="file" @change="onFileChange" accept=".pdf,.doc,.docx,.txt" />
      <!-- 新增：已选文件回显 -->
      <p v-if="file" class="file-hint">已选择：{{ file.name }}（{{ (file.size / 1024).toFixed(1) }} KB）</p>
      <button @click="handlePredict" :disabled="loading || !file">
        {{ loading ? '分析中...' : '开始预测' }}
      </button>
      <!-- 新增：分析中提示 -->
      <p v-if="loading" class="loading-hint">AI 正在分析文档，可能需要数十秒，请勿关闭页面。</p>
    </div>
    <!-- 新增：错误提示 -->
    <p v-if="error" class="form-error">{{ error }}</p>
    <div v-if="result" class="result-area">
      <h3>预测结果</h3>
      <!-- 新增：关键字段结构化展示（字段存在才渲染），原始 JSON 保留在下方便于排查 -->
      <div v-if="result.cropName || result.summary || result.suggestion || result.advice" class="result-summary">
        <p v-if="result.cropName"><b>作物名：</b>{{ result.cropName }}</p>
        <p v-if="result.summary"><b>分析摘要：</b>{{ result.summary }}</p>
        <p v-if="result.suggestion || result.advice"><b>种植建议：</b>{{ result.suggestion || result.advice }}</p>
      </div>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      <!-- 新增：结果页快捷入口 -->
      <div class="result-actions">
        <RouterLink to="/history"><button>查看历史记录</button></RouterLink>
      </div>
    </div>
  </div>
</template>
