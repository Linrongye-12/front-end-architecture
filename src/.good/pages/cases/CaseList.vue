<template>
  <div class="case-list">
    <div class="page-header">
      <h2>方案案例库</h2>
      <div class="filter-bar">
        <select v-model="filters.region" @change="loadCases">
          <option value="">全部区域</option>
          <option>山东</option><option>河南</option><option>河北</option><option>安徽</option>
        </select>
        <select v-model="filters.cropType" @change="loadCases">
          <option value="">全部作物</option>
          <option>水稻</option><option>玉米</option><option>小麦</option><option>大豆</option>
        </select>
        <select v-model="filters.riskLevel" @change="loadCases">
          <option value="">全部风险等级</option>
          <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
        </select>
      </div>
    </div>
    <p v-if="error" class="form-error">{{ error }}</p>
    <div class="case-cards">
      <div v-for="c in cases" :key="c.caseId" class="case-card" @click="goDetail(c.caseId)">
        <h3>{{ c.projectName }}</h3>
        <div class="info">
          <span>{{ c.region }}</span>
          <span>{{ c.cropType }}</span>
          <span>{{ c.plantingArea }}亩</span>
        </div>
        <p class="summary">{{ c.improvementSummary }}</p>
        <div class="meta">
          <span class="risk" :class="c.riskLevel">风险: {{ riskLabel(c.riskLevel) }}</span>
          <span>浏览: {{ c.viewCount }}</span>
        </div>
      </div>
    </div>
    <div class="pagination">
      <button @click="prevPage" :disabled="page <= 1">上一页</button>
      <span>第 {{ page }} 页</span>
      <button @click="nextPage" :disabled="page >= totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCases, listFrom, errMessage } from '../../api'

const router = useRouter()
const cases = ref<any[]>([])
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const filters = ref({ region: '', cropType: '', riskLevel: '' })
const totalPages = ref(1)
const error = ref('')

function riskLabel(r: string) {
  const map: Record<string, string> = { high: '高', medium: '中', low: '低' }
  return map[r] || r
}

async function loadCases() {
  error.value = ''
  try {
    const res = await getCases({
      page: page.value, pageSize: pageSize.value,
      region: filters.value.region || undefined,
      cropType: filters.value.cropType || undefined,
      riskLevel: filters.value.riskLevel || undefined
    })
    cases.value = listFrom(res)
    total.value = res?.total ?? cases.value.length
    totalPages.value = Math.ceil(total.value / pageSize.value) || 1
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

function prevPage() { if (page.value > 1) { page.value--; loadCases() } }
function nextPage() { if (page.value < totalPages.value) { page.value++; loadCases() } }
function goDetail(id: string) { router.push(`/cases/${id}`) }

onMounted(loadCases)
</script>

<style scoped>
/* 视觉升级：套用全站设计系统（自然绿 + 大圆角卡片 + 柔和阴影），功能与脚本不变 */
.case-list { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 20px; }
.filter-bar { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.filter-bar select { padding: 9px 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); }
.case-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
.case-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px; cursor: pointer; box-shadow: var(--shadow-sm); transition: transform .18s, box-shadow .2s; }
.case-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.case-card h3 { font-size: 15.5px; }
.info { display: flex; gap: 8px; color: var(--ink-2); font-size: 12.5px; margin: 10px 0; flex-wrap: wrap; }
.info span { background: var(--bg-soft); padding: 3px 10px; border-radius: 999px; }
.summary { color: var(--ink-2); font-size: 13.5px; line-height: 1.7; }
.meta { display: flex; justify-content: space-between; color: var(--ink-3); font-size: 12px; margin-top: 12px; }
.risk.high { color: var(--danger); font-weight: 600; }
.risk.medium { color: var(--warn); font-weight: 600; }
.risk.low { color: var(--ok); font-weight: 600; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 24px; color: var(--ink-2); }
.pagination button { padding: 8px 18px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); color: var(--ink-2); cursor: pointer; font-weight: 500; }
.pagination button:hover:not(:disabled) { background: var(--green-soft); border-color: var(--green); color: var(--green-deep); }
</style>
