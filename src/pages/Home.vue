<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api, listFrom } from '../api';
import { errMessage } from '../api'; // 新增：统一错误提示
import { weatherState } from '../weather'; // 新增：顶栏天气数据（温度/湿度为真实值）
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

// 新增：环境实时监测数据（温度/湿度取自真实天气；光照为按时段+天气的估算值）
const envData = computed(() => {
  const temp = weatherState.temp;
  const humidity = weatherState.humidity;
  // 光照估算：6:00-18:00 正弦日照曲线 × 天气系数 × 100000 lux（晴天正午峰值）
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  const daylight = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));
  const t = weatherState.text;
  const factor =
    t.includes('雷') || t.includes('雨') || t.includes('雪')
      ? 0.22
      : t.includes('阴')
        ? 0.35
        : t.includes('云')
          ? 0.6
          : t.includes('晴')
            ? 1
            : 0.7;
  const lux = Math.round((daylight * factor * 100000) / 100) * 100;
  return {
    temp,
    humidity,
    lux,
    luxLevel: lux >= 32000 ? '强' : lux >= 10000 ? '中等' : lux > 0 ? '弱' : '夜间',
    tempPct: temp != null ? Math.min(1, Math.max(0, temp / 40)) : 0,
    humPct: humidity != null ? Math.min(1, humidity / 100) : 0,
    luxPct: lux / 100000,
    tempStatus:
      temp == null ? '待获取' : temp >= 15 && temp <= 30 ? '适宜' : temp < 15 ? '偏冷' : '偏热',
    humStatus:
      humidity == null
        ? '待获取'
        : humidity >= 40 && humidity <= 70
          ? '适宜'
          : humidity < 40
            ? '偏干'
            : '偏湿'
  };
});
</script>
<template>
  <div class="history-page">
    <!-- 视觉升级（参考 Agro 落地页）：全幅农田 Hero + 衬线斜体大标题 + 双按钮 + 浮动图片卡 -->
    <section class="home-hero" v-reveal>
      <div class="hero-inner">
        <span class="eyebrow">✦ 提供面向未来的智慧农业解决方案</span>
        <h1 class="hero-title">
          科学种植
          <em>智慧丰收</em>
        </h1>
        <div class="hero-actions">
          <RouterLink to="/prediction" class="btn-lime">
            开始智能预测
            <span class="arrow-circle">↗</span>
          </RouterLink>
          <RouterLink to="/history" class="btn-white">
            查看预测记录
            <span class="arrow-circle dark">→</span>
          </RouterLink>
        </div>
        <!-- 保留原有磨砂数据条 -->
        <div class="hero-stats">
          <div class="stat-chip"><span class="chip-dot ok"></span>土壤湿度 <b>62%</b></div>
          <div class="stat-chip"><span class="chip-dot ok"></span>氮磷钾养分 <b>均衡</b></div>
          <div class="stat-chip"><span class="chip-dot warn"></span>病虫害风险 <b>低</b></div>
        </div>
      </div>
    </section>

    <!-- 新增：关于区块（徽章 + 大标题 + 标签组） -->
    <section class="about-block" v-reveal>
      <span class="about-badge">● 关于我们</span>
      <div class="about-body">
        <h2 class="about-heading">种植户和乡村社区面临的挑战，通过智慧农业创新迎刃而解。</h2>
        <div class="tag-row">
          <span class="tag-chip">智慧种植</span>
          <span class="tag-chip">绿色可持续</span>
          <span class="tag-chip">农业创新</span>
          <span class="tag-chip">丰收未来</span>
        </div>
      </div>
    </section>

    <!-- 新增：环境实时监测（温室实景浮动卡 + 温度/湿度/光照数据卡） -->
    <section class="env-section" v-reveal>
      <!-- 渐变定义：三个仪表盘共用 -->
      <svg width="0" height="0" style="position: absolute">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#8BC34A" />
            <stop offset="55%" stop-color="#D9E95A" />
            <stop offset="100%" stop-color="#F5A623" />
          </linearGradient>
        </defs>
      </svg>
      <div class="env-head">
        <span class="env-leaf">🌿</span>
        <div>
          <h2>环境实时监测</h2>
          <small>温室环境数据 · 自动更新</small>
        </div>
      </div>
      <div class="env-grid">
        <!-- 左：温室实景浮动卡（悬浮标签 + 深色切换胶囊） -->
        <div class="env-photo-card" v-reveal="'0.1s'">
          <img
            src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=1200&q=80&auto=format&fit=crop"
            alt="温室实景"
          />
          <div class="env-photo-tabs">
            <span class="tab active">实时数据</span>
            <span class="tab">实景视图</span>
          </div>
          <span class="env-photo-label">温室 · 1 区</span>
        </div>
        <!-- 右：数据卡片 -->
        <div class="env-cards">
          <div class="env-card" v-reveal="'0.15s'">
            <div class="env-card-top">
              <span class="env-card-name">当前温度</span>
              <span
                class="env-status"
                :class="{ warn: envData.tempStatus !== '适宜' && envData.tempStatus !== '待获取' }"
                >{{ envData.tempStatus }}</span
              >
            </div>
            <svg class="gauge" viewBox="0 0 100 56">
              <path class="gauge-bg" d="M8 50 A42 42 0 0 1 92 50" />
              <path
                class="gauge-fg"
                d="M8 50 A42 42 0 0 1 92 50"
                :stroke-dasharray="`${(envData.tempPct * 132).toFixed(1)} 132`"
              />
            </svg>
            <b class="env-value">{{ envData.temp != null ? envData.temp + '°C' : '--' }}</b>
            <small class="env-note">适宜范围 15 ~ 30°C</small>
          </div>
          <div class="env-card" v-reveal="'0.25s'">
            <div class="env-card-top">
              <span class="env-card-name">空气湿度</span>
              <span
                class="env-status"
                :class="{ warn: envData.humStatus !== '适宜' && envData.humStatus !== '待获取' }"
                >{{ envData.humStatus }}</span
              >
            </div>
            <svg class="gauge" viewBox="0 0 100 56">
              <path class="gauge-bg" d="M8 50 A42 42 0 0 1 92 50" />
              <path
                class="gauge-fg"
                d="M8 50 A42 42 0 0 1 92 50"
                :stroke-dasharray="`${(envData.humPct * 132).toFixed(1)} 132`"
              />
            </svg>
            <b class="env-value">{{ envData.humidity != null ? envData.humidity + '%' : '--' }}</b>
            <small class="env-note">适宜范围 40% ~ 70%</small>
          </div>
          <div class="env-card env-card-wide" v-reveal="'0.35s'">
            <div class="env-card-top">
              <span class="env-card-name">光照强度</span>
              <span class="env-status">{{ envData.luxLevel }}</span>
            </div>
            <div class="env-wide-body">
              <div class="env-wide-value">
                <b class="env-value">{{
                  envData.lux > 0 ? envData.lux.toLocaleString() + ' lx' : '夜间'
                }}</b>
                <small class="env-note">{{
                  envData.lux > 0 ? '估算值 · 依据当前时段与天气推算' : '当前时段无自然光照'
                }}</small>
              </div>
              <svg class="gauge gauge-wide" viewBox="0 0 100 56">
                <path class="gauge-bg" d="M8 50 A42 42 0 0 1 92 50" />
                <path
                  class="gauge-fg"
                  d="M8 50 A42 42 0 0 1 92 50"
                  :stroke-dasharray="`${(envData.luxPct * 132).toFixed(1)} 132`"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 新增：标题栏 + 刷新按钮 -->
    <div class="page-head" v-reveal>
      <h2>历史预测记录</h2>
      <button class="ghost-btn" @click="refresh" :disabled="loading">
        {{ loading ? '刷新中...' : '刷新' }}
      </button>
    </div>
    <div v-if="loading">加载中...</div>
    <!-- 新增：加载失败提示 -->
    <p v-else-if="error" class="form-error">{{ error }}</p>
    <!-- 视觉升级：记录表格 → 卡片网格（数据字段与跳转逻辑不变） -->
    <div v-else-if="records.length" class="record-grid">
      <div
        v-for="(r, i) in records"
        :key="r.id"
        class="record-card"
        v-reveal="Math.min(i, 8) * 0.06 + 's'"
      >
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
