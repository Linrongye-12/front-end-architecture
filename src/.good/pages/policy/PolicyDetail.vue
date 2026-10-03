<template>
  <div class="policy-detail" v-if="policy || error">
    <button class="back-btn" @click="$router.back()">返回列表</button>
    <p v-if="error" class="form-error">{{ error }}</p>
    <template v-if="policy">
    <div class="policy-header">
      <span class="tag" :class="policy.type">{{ typeLabel(policy.type) }}</span>
      <h1>{{ policy.title }}</h1>
      <div class="meta">
        <span>来源: {{ policy.source }}</span>
        <span>发布时间: {{ policy.publishTime }}</span>
        <span v-if="policy.region">区域: {{ policy.region }}</span>
      </div>
    </div>
    <div class="policy-content" v-html="policy.content"></div>
    <div v-if="policy.attachments && policy.attachments.length" class="attachments">
      <h3>附件</h3>
      <a v-for="(att, i) in JSON.parse(policy.attachments)" :key="i" :href="att.url">{{ att.name }}</a>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPolicyDetail, errMessage } from '../../api'

const route = useRoute()
const policy = ref<any>(null)
const error = ref('')

function typeLabel(t: string) {
  const map: Record<string, string> = {
    notice: '禁限用通知', subsidy: '补贴政策', document: '农业部文件',
    pest_alert: '病虫害预警', weather_alert: '天气预警'
  }
  return map[t] || t
}

onMounted(async () => {
  error.value = ''
  try {
    policy.value = await getPolicyDetail(route.params.id as string)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
})
</script>

<style scoped>
/* 视觉升级：套用全站设计系统（自然绿 + 大圆角卡片 + 柔和阴影），功能与脚本不变 */
.policy-detail { max-width: 800px; margin: 0 auto; padding: 0; }
.back-btn { margin-bottom: 16px; padding: 8px 18px; cursor: pointer; background: var(--card); color: var(--green-deep); border: 1px solid var(--line); border-radius: 999px; font-weight: 600; }
.back-btn:hover { background: var(--green-soft); }
.policy-header { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-xl); padding: 28px; box-shadow: var(--shadow-sm); margin-top: 16px; }
.policy-header h1 { font-size: 24px; margin: 4px 0 8px; line-height: 1.45; }
.tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 8px; }
.tag.notice { background: #E88D82; }
.tag.subsidy { background: var(--green); }
.tag.document { background: #7FA8D9; }
.tag.pest_alert { background: #E3A66F; }
.tag.weather_alert { background: #A99BD6; }
.meta { color: var(--ink-3); font-size: 13px; margin: 8px 0 0; display: flex; gap: 16px; flex-wrap: wrap; }
.policy-content { line-height: 1.9; margin: 20px 0; background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-sm); }
.attachments { margin-top: 20px; }
.attachments h3 { margin-bottom: 10px; }
.attachments a { display: block; padding: 10px 14px; background: var(--card-tint); border: 1px solid var(--line); border-radius: var(--radius-sm); margin: 6px 0; color: var(--green-deep); font-weight: 500; }
.attachments a:hover { background: var(--green-soft); }
</style>
