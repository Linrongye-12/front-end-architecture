<template>
  <div class="admin-qa">
    <h2>问答管理</h2>
    <div class="tabs">
      <button :class="{ active: tab === 'faqs' }" @click="tab = 'faqs'">FAQ管理</button>
      <button :class="{ active: tab === 'intents' }" @click="tab = 'intents'">意图标签管理</button>
    </div>
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <div v-if="tab === 'faqs'" class="tab-content">
      <button class="btn-primary" @click="openFaqCreate">新增FAQ</button>
      <table>
        <thead><tr><th>问题</th><th>意图</th><th>优先级</th><th>命中次数</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="f in faqs" :key="f.faqId">
            <td>{{ f.question }}</td><td>{{ intentLabel(f.intent) }}</td><td>{{ f.priority }}</td><td>{{ f.hitCount }}</td><td>{{ f.status }}</td>
            <td><button @click="openFaqEdit(f)">编辑</button><button @click="removeFaq(f)">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="tab === 'intents'" class="tab-content">
      <table>
        <thead><tr><th>意图类型</th><th>意图标签</th><th>关键词</th><th>路由Agent</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="t in intentTags" :key="t.intentType">
            <td>{{ t.intentType }}</td><td>{{ t.intentLabel }}</td><td>{{ (t.keywords || []).join(', ') }}</td><td>{{ t.routingAgent }}</td><td>{{ t.isActive ? '启用' : '禁用' }}</td>
            <td><button @click="openIntentEdit(t)">编辑</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showFaqForm" class="modal">
      <div class="modal-content">
        <h3>{{ editingFaqId ? '编辑FAQ' : '新增FAQ' }}</h3>
        <form @submit.prevent="saveFaq">
          <textarea v-model="faqForm.question" placeholder="问题" rows="2" required></textarea>
          <textarea v-model="faqForm.answer" placeholder="标准答案" rows="4" required></textarea>
          <select v-model="faqForm.intent">
            <option value="agriculture">农业知识问答</option><option value="policy">政策解读</option>
            <option value="pesticide">农药咨询</option><option value="crop">种植技术指导</option><option value="market">市场行情分析</option>
          </select>
          <input v-model.number="faqForm.priority" type="number" placeholder="优先级" />
          <div class="form-actions">
            <button type="submit" :disabled="saving">保存</button>
            <button type="button" @click="showFaqForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showIntentForm" class="modal">
      <div class="modal-content">
        <h3>编辑意图标签</h3>
        <form @submit.prevent="saveIntent">
          <input v-model="intentForm.intentLabel" placeholder="意图标签" required />
          <input v-model="intentForm.keywordsText" placeholder="关键词（逗号分隔）" />
          <input v-model="intentForm.routingAgent" placeholder="路由Agent" />
          <label class="check"><input type="checkbox" v-model="intentForm.isActive" /> 启用</label>
          <div class="form-actions">
            <button type="submit" :disabled="saving">保存</button>
            <button type="button" @click="showIntentForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getAdminFaqs, getAdminIntentTags,
  adminCreateFaq, adminUpdateFaq, adminDeleteFaq, adminManageIntentTags,
  listFrom, errMessage
} from '../../api'

const tab = ref('faqs')
const faqs = ref<any[]>([])
const intentTags = ref<any[]>([])
const error = ref('')
const msg = ref('')
const saving = ref(false)

const showFaqForm = ref(false)
const editingFaqId = ref('')
const faqForm = ref({ question: '', answer: '', intent: 'agriculture', priority: 0 })

const showIntentForm = ref(false)
const editingIntentType = ref('')
const intentForm = ref({ intentLabel: '', keywordsText: '', routingAgent: '', isActive: true })

function intentLabel(i: string) { const m: Record<string, string> = { agriculture: '农业知识问答', policy: '政策解读', pesticide: '农药咨询', crop: '种植技术指导', market: '市场行情分析' }; return m[i] || i }

async function loadAll() {
  error.value = ''
  try {
    const [faqRes, tagRes] = await Promise.all([
      getAdminFaqs({ page: 1, pageSize: 100 }),
      getAdminIntentTags({ page: 1, pageSize: 100 })
    ])
    faqs.value = listFrom(faqRes)
    intentTags.value = listFrom(tagRes)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

function openFaqCreate() {
  editingFaqId.value = ''
  faqForm.value = { question: '', answer: '', intent: 'agriculture', priority: 0 }
  showFaqForm.value = true
}
function openFaqEdit(f: any) {
  editingFaqId.value = f.faqId
  faqForm.value = { question: f.question, answer: f.answer ?? '', intent: f.intent ?? 'agriculture', priority: f.priority ?? 0 }
  showFaqForm.value = true
}
async function saveFaq() {
  saving.value = true
  error.value = ''; msg.value = ''
  try {
    if (editingFaqId.value) {
      await adminUpdateFaq(editingFaqId.value, faqForm.value)
      msg.value = '保存成功'
    } else {
      await adminCreateFaq(faqForm.value)
      msg.value = '新增成功'
    }
    showFaqForm.value = false
    await loadAll()
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  } finally {
    saving.value = false
  }
}
async function removeFaq(f: any) {
  if (!confirm(`确定删除FAQ「${f.question}」吗？`)) return
  error.value = ''; msg.value = ''
  try {
    await adminDeleteFaq(f.faqId)
    msg.value = '删除成功'
    faqs.value = faqs.value.filter(i => i.faqId !== f.faqId)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

function openIntentEdit(t: any) {
  editingIntentType.value = t.intentType
  intentForm.value = {
    intentLabel: t.intentLabel,
    keywordsText: (t.keywords || []).join(', '),
    routingAgent: t.routingAgent ?? '',
    isActive: t.isActive !== false
  }
  showIntentForm.value = true
}
async function saveIntent() {
  saving.value = true
  error.value = ''; msg.value = ''
  try {
    await adminManageIntentTags({
      intentType: editingIntentType.value,
      ...intentForm.value,
      keywords: intentForm.value.keywordsText.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    })
    msg.value = '保存成功'
    showIntentForm.value = false
    await loadAll()
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  } finally {
    saving.value = false
  }
}

onMounted(loadAll)
</script>
