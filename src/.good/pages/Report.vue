<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router'; // 新增：返回导航
import { api } from '../api';
import { errMessage } from '../api'; // 新增：统一错误提示
const route = useRoute();
const router = useRouter(); // 新增
const report = ref<any>(null);
const error = ref(''); // 新增：加载失败提示
const feedbackSent = ref(''); // 新增：已提交的反馈类型（like/dislike）

onMounted(async () => {
  try {
    report.value = await api.planting.getReport({ id: route.params.id });
  } catch (err) {
    console.error(err);
    error.value = errMessage(err); // 新增
  }
});

// 新增：提交报告反馈（对接已有 api.planting.submitFeedback）
async function sendFeedback(type: 'like' | 'dislike') {
  if (feedbackSent.value) return;
  try {
    await api.planting.submitFeedback({ id: route.params.id, feedback: type });
    feedbackSent.value = type;
  } catch (err) {
    console.error(err);
    error.value = errMessage(err);
  }
}
</script>
<template>
  <div class="report-page">
    <!-- 新增：标题栏 + 返回历史列表 -->
    <div class="page-head">
      <h2>预测报告</h2>
      <button class="ghost-btn" @click="router.push('/history')">← 返回历史</button>
    </div>
    <div v-if="report">
      <!-- 新增：关键字段结构化展示（字段存在才渲染），原始 JSON 保留便于排查 -->
      <div v-if="report.cropName || report.summary || report.suggestion || report.advice" class="result-summary">
        <p v-if="report.cropName"><b>作物名：</b>{{ report.cropName }}</p>
        <p v-if="report.summary"><b>分析摘要：</b>{{ report.summary }}</p>
        <p v-if="report.suggestion || report.advice"><b>种植建议：</b>{{ report.suggestion || report.advice }}</p>
      </div>
      <pre>{{ JSON.stringify(report, null, 2) }}</pre>
      <!-- 新增：报告反馈（有用/不准确），提交后不可重复提交 -->
      <div class="feedback-bar">
        <span>此报告是否有帮助？</span>
        <button :disabled="!!feedbackSent" :class="{ active: feedbackSent === 'like' }" @click="sendFeedback('like')">有用</button>
        <button :disabled="!!feedbackSent" :class="{ active: feedbackSent === 'dislike' }" @click="sendFeedback('dislike')">不准确</button>
        <small v-if="feedbackSent">已收到您的反馈，谢谢您！</small>
      </div>
    </div>
    <!-- 补全：区分"加载失败"与"加载中" -->
    <p v-else-if="error" class="form-error">{{ error }}</p>
    <p v-else>加载中...</p>
  </div>
</template>
