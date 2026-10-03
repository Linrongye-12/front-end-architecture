<template>
  <div class="policy-list">
    <div class="page-header">
      <h2>农业政策与行业动态中心</h2>
      <div class="filter-bar">
        <select v-model="filters.type" @change="loadPolicies">
          <option value="">全部类型</option>
          <option value="notice">禁限用通知</option>
          <option value="subsidy">补贴政策</option>
          <option value="document">农业部文件</option>
          <option value="pest_alert">病虫害预警</option>
          <option value="weather_alert">天气预警</option>
        </select>
        <input v-model="filters.region" placeholder="区域筛选" @change="loadPolicies" />
        <input v-model="filters.keyword" placeholder="搜索政策" @keyup.enter="loadPolicies" />
      </div>
    </div>
    <p v-if="error" class="form-error">{{ error }}</p>
    <div class="policy-cards">
      <div v-for="p in policies" :key="p.policyId" class="policy-card" @click="goDetail(p.policyId)">
        <span class="tag" :class="p.type">{{ typeLabel(p.type) }}</span>
        <h3>{{ p.title }}</h3>
        <p class="summary">{{ p.summary }}</p>
        <div class="meta">
          <span>{{ p.publishTime }}</span>
          <span>{{ p.source }}</span>
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
import { getPolicies, listFrom, errMessage } from '../../api'

const router = useRouter()
const policies = ref<any[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filters = ref({ type: '', region: '', keyword: '' })
const error = ref('')

const totalPages = ref(1)

function typeLabel(t: string) {
  const map: Record<string, string> = {
    notice: '禁限用通知', subsidy: '补贴政策', document: '农业部文件',
    pest_alert: '病虫害预警', weather_alert: '天气预警'
  }
  return map[t] || t
}

async function loadPolicies() {
  error.value = ''
  try {
    const res = await getPolicies({
      page: page.value, pageSize: pageSize.value,
      type: filters.value.type || undefined,
      region: filters.value.region || undefined,
      keyword: filters.value.keyword || undefined
    })
    policies.value = listFrom(res)
    total.value = res?.total ?? policies.value.length
    totalPages.value = Math.ceil(total.value / pageSize.value) || 1
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

function prevPage() { if (page.value > 1) { page.value--; loadPolicies() } }
function nextPage() { if (page.value < totalPages.value) { page.value++; loadPolicies() } }
function goDetail(id: string) { router.push(`/policy/${id}`) }

onMounted(loadPolicies)
</script>

<style scoped>
/* 视觉升级：套用全站设计系统（自然绿 + 大圆角卡片 + 柔和阴影），功能与脚本不变 */
.policy-list { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 20px; }
.filter-bar { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.filter-bar select, .filter-bar input { padding: 9px 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); }
.filter-bar select:focus, .filter-bar input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px var(--green-soft); }
.policy-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
.policy-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px; cursor: pointer; box-shadow: var(--shadow-sm); transition: transform .18s, box-shadow .2s; }
.policy-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 10px; }
.tag.notice { background: #E88D82; }
.tag.subsidy { background: var(--green); }
.tag.document { background: #7FA8D9; }
.tag.pest_alert { background: #E3A66F; }
.tag.weather_alert { background: #A99BD6; }
.summary { color: var(--ink-2); font-size: 13.5px; margin: 8px 0; line-height: 1.7; }
.meta { display: flex; justify-content: space-between; color: var(--ink-3); font-size: 12px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 24px; color: var(--ink-2); }
.pagination button { padding: 8px 18px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); color: var(--ink-2); cursor: pointer; font-weight: 500; }
.pagination button:hover:not(:disabled) { background: var(--green-soft); border-color: var(--green); color: var(--green-deep); }
</style>
