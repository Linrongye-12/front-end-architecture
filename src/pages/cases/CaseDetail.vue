<template>
  <div class="case-detail" v-if="caseObj || error">
    <button class="back-btn" @click="$router.back()">返回列表</button>
    <p v-if="error" class="form-error">{{ error }}</p>
    <template v-if="caseObj">
    <h1>{{ caseObj.projectName }}</h1>
    <div class="info">
      <span>区域: {{ caseObj.region }}</span>
      <span>作物: {{ caseObj.cropType }}</span>
      <span>面积: {{ caseObj.plantingArea }}亩</span>
    </div>
    <div class="comparison">
      <div class="plan original">
        <h3>原方案</h3>
        <pre>{{ formatPlan(caseObj.originalPlan) }}</pre>
      </div>
      <div class="plan optimized">
        <h3>优化方案</h3>
        <pre>{{ formatPlan(caseObj.optimizedPlan) }}</pre>
      </div>
    </div>
    <div class="result">
      <h3>改进效果</h3>
      <p>{{ caseObj.finalYield }}</p>
      <p>{{ caseObj.improvementSummary }}</p>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCaseDetail, errMessage } from '../../api'

const route = useRoute()
const caseObj = ref<any>(null)
const error = ref('')

function formatPlan(plan: string) {
  try { return JSON.stringify(JSON.parse(plan), null, 2) } catch { return plan }
}

onMounted(async () => {
  error.value = ''
  try {
    caseObj.value = await getCaseDetail(route.params.id as string)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
})
</script>

<style scoped>
/* 视觉升级：套用全站设计系统（自然绿 + 大圆角卡片 + 柔和阴影），功能与脚本不变 */
.case-detail { max-width: 900px; margin: 0 auto; padding: 0; }
.back-btn { margin-bottom: 16px; padding: 8px 18px; cursor: pointer; background: var(--card); color: var(--green-deep); border: 1px solid var(--line); border-radius: 999px; font-weight: 600; }
.back-btn:hover { background: var(--green-soft); }
.case-detail h1 { font-size: 24px; margin: 12px 0 4px; }
.info { display: flex; gap: 10px; color: var(--ink-2); margin: 12px 0; flex-wrap: wrap; font-size: 13px; }
.info span { background: var(--card); border: 1px solid var(--line); padding: 5px 12px; border-radius: 999px; }
.comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 22px 0; }
.plan { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 18px; box-shadow: var(--shadow-sm); }
.plan h3 { margin-top: 0; font-size: 15px; }
.plan pre { background: var(--bg-soft); padding: 14px; border-radius: var(--radius-md); overflow-x: auto; font-size: 12.5px; line-height: 1.7; }
.plan.original pre { border-left: 3px solid var(--danger); }
.plan.optimized pre { border-left: 3px solid var(--ok); }
.result { margin-top: 22px; padding: 20px; background: var(--green-soft); border: 1px solid var(--line); border-radius: var(--radius-lg); }
.result h3 { margin-top: 0; color: var(--green-deep); }
@media (max-width: 768px) {
  .comparison { grid-template-columns: 1fr; }
}
</style>
