<template>
  <div class="admin-cases">
    <h2>案例库管理</h2>
    <button class="btn-primary" @click="openCreate">新增案例</button>
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <table>
      <thead><tr><th>项目名称</th><th>区域</th><th>作物</th><th>面积</th><th>风险等级</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="c in cases" :key="c.caseId">
          <td>{{ c.projectName }}</td><td>{{ c.region }}</td><td>{{ c.cropType }}</td><td>{{ c.plantingArea }}亩</td>
          <td>{{ riskLabel(c.riskLevel) }}</td><td>{{ c.status }}</td>
          <td><button @click="openEdit(c)">编辑</button><button @click="removeCase(c)">删除</button></td>
        </tr>
      </tbody>
    </table>
    <div v-if="showForm" class="modal">
      <div class="modal-content">
        <h3>{{ editingId ? '编辑方案案例' : '新增方案案例' }}</h3>
        <form @submit.prevent="saveCase">
          <input v-model="form.projectName" placeholder="项目名称" required />
          <input v-model="form.region" placeholder="区域" required />
          <input v-model="form.cropType" placeholder="作物类型" required />
          <input v-model="form.plantingArea" type="number" placeholder="种植面积(亩)" />
          <select v-model="form.riskLevel"><option value="high">高</option><option value="medium">中</option><option value="low">低</option></select>
          <textarea v-model="form.originalPlan" placeholder="原方案(JSON)" rows="4"></textarea>
          <textarea v-model="form.optimizedPlan" placeholder="优化方案(JSON)" rows="4"></textarea>
          <textarea v-model="form.improvementSummary" placeholder="改进效果总结" rows="2"></textarea>
          <div class="form-actions">
            <button type="submit" :disabled="saving">保存</button>
            <button type="button" @click="showForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCases, adminCreateCase, adminUpdateCase, adminDeleteCase, listFrom, errMessage } from '../../api'

const cases = ref<any[]>([])
const showForm = ref(false)
const saving = ref(false)
const editingId = ref('')
const error = ref('')
const msg = ref('')
const form = ref({ projectName: '', region: '', cropType: '', plantingArea: '', riskLevel: 'medium', originalPlan: '', optimizedPlan: '', improvementSummary: '' })

function riskLabel(r: string) { const m: Record<string, string> = { high: '高', medium: '中', low: '低' }; return m[r] || r }

async function loadCases() {
  error.value = ''
  try {
    const res = await getCases({ page: 1, pageSize: 100 })
    cases.value = listFrom(res)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

function openCreate() {
  editingId.value = ''
  form.value = { projectName: '', region: '', cropType: '', plantingArea: '', riskLevel: 'medium', originalPlan: '', optimizedPlan: '', improvementSummary: '' }
  showForm.value = true
}

function openEdit(c: any) {
  editingId.value = c.caseId
  form.value = { ...form.value, ...c }
  showForm.value = true
}

async function saveCase() {
  saving.value = true
  error.value = ''; msg.value = ''
  try {
    if (editingId.value) {
      await adminUpdateCase(editingId.value, form.value)
      msg.value = '保存成功'
    } else {
      await adminCreateCase(form.value)
      msg.value = '新增成功'
    }
    showForm.value = false
    await loadCases()
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  } finally {
    saving.value = false
  }
}

async function removeCase(c: any) {
  if (!confirm(`确定删除案例「${c.projectName}」吗？`)) return
  error.value = ''; msg.value = ''
  try {
    await adminDeleteCase(c.caseId)
    msg.value = '删除成功'
    cases.value = cases.value.filter(i => i.caseId !== c.caseId)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

onMounted(loadCases)
</script>
