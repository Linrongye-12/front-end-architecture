<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, listFrom } from '../api';
import { errMessage } from '../api'; // 新增：统一错误提示
const records = ref<any[]>([]);
const loading = ref(false);
const error = ref(''); // 新增：加载失败提示

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.planting.history({ page: 1, size: 20 });
    records.value = listFrom(res);
  } catch (err) {
    console.error(err);
    error.value = errMessage(err); // 新增
  } finally {
    loading.value = false;
  }
});

// 新增：手动刷新列表（与 onMounted 加载逻辑一致）
async function refresh() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.planting.history({ page: 1, size: 20 });
    records.value = listFrom(res);
  } catch (err) {
    console.error(err);
    error.value = errMessage(err);
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div class="history-page">
    <!-- 视觉升级：欢迎横幅（农田实景 + 磨砂玻璃数据条），纯展示不改功能 -->
    <div class="home-hero">
      <div class="home-hero-text">
        <p class="eyebrow">农策审 · AI 智能决策</p>
        <h1>科学种植，智慧丰收</h1>
        <p class="hero-sub">上传种植记录文档，AI 分析作物长势并给出个性化种植建议</p>
        <RouterLink to="/prediction" class="btn-lime">开始智能预测 →</RouterLink>
      </div>
      <div class="hero-stats">
        <div class="stat-chip"><span class="chip-dot ok"></span>土壤湿度 <b>62%</b></div>
        <div class="stat-chip"><span class="chip-dot ok"></span>氮磷钾养分 <b>均衡</b></div>
        <div class="stat-chip"><span class="chip-dot warn"></span>病虫害风险 <b>低</b></div>
      </div>
    </div>
    <!-- 新增：标题栏 + 刷新按钮 -->
    <div class="page-head">
      <h2>历史预测记录</h2>
      <button class="ghost-btn" @click="refresh" :disabled="loading">{{ loading ? '刷新中...' : '刷新' }}</button>
    </div>
    <div v-if="loading">加载中...</div>
    <!-- 新增：加载失败提示 -->
    <p v-else-if="error" class="form-error">{{ error }}</p>
    <!-- 视觉升级：记录表格 → 卡片网格（数据字段与跳转逻辑不变） -->
    <div v-else-if="records.length" class="record-grid">
      <div v-for="r in records" :key="r.id" class="record-card">
        <div class="record-top">
          <div>
            <b>{{ r.cropName || '未知作物' }}</b>
            <small>{{ r.createdAt || '-' }}</small>
          </div>
          <span class="status-dot" title="正常"></span>
        </div>
        <div class="record-foot">
          <span class="record-status">{{ r.status || '-' }}</span>
          <RouterLink class="card-link" :to="`/report/${r.id}`">查看报告 →</RouterLink>
        </div>
      </div>
    </div>
    <p v-else class="empty-hint">暂无历史记录</p>
  </div>
</template>
