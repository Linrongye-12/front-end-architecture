<template>
  <div class="admin-policy">
    <h2>政策/预警管理</h2>
    <button class="btn-primary" @click="showForm = true">新增政策</button>
    <table>
      <thead>
        <tr><th>标题</th><th>类型</th><th>区域</th><th>状态</th><th>发布时间</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="p in policies" :key="p.policyId">
          <td>{{ p.title }}</td>
          <td>{{ typeLabel(p.type) }}</td>
          <td>{{ p.region || '全国' }}</td>
          <td>{{ statusLabel(p.status) }}</td>
          <td>{{ p.publishTime }}</td>
          <td>
            <button @click="editPolicy(p)">编辑</button>
            <button @click="deletePolicy(p.policyId)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="showForm" class="modal">
      <div class="modal-content">
        <h3>{{ editingPolicy ? '编辑政策' : '新增政策' }}</h3>
        <form @submit.prevent="savePolicy">
          <input v-model="form.title" placeholder="标题" required />
          <select v-model="form.type">
            <option value="notice">禁限用通知</option>
            <option value="subsidy">补贴政策</option>
            <option value="document">农业部文件</option>
            <option value="pest_alert">病虫害预警</option>
            <option value="weather_alert">天气预警</option>
          </select>
          <input v-model="form.region" placeholder="区域（留空为全国）" />
          <select v-model="form.alertLevel" v-if="form.type === 'pest_alert' || form.type === 'weather_alert'">
            <option value="red">红色(紧急)</option>
            <option value="orange">橙色(重要)</option>
            <option value="yellow">黄色(一般)</option>
            <option value="blue">蓝色(关注)</option>
          </select>
          <textarea v-model="form.content" placeholder="正文内容" rows="6"></textarea>
          <div class="form-actions">
            <button type="submit">保存</button>
            <button type="button" @click="showForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { adminCreatePolicy, adminUpdatePolicy, adminDeletePolicy } from '../../api'

const policies = ref<any[]>([])
const showForm = ref(false)
const editingPolicy = ref<any>(null)
const form = ref({ title: '', type: '', region: '', alertLevel: '', content: '' })

function typeLabel(t: string) {
  const map: Record<string, string> = { notice: '禁限用通知', subsidy: '补贴政策', document: '农业部文件', pest_alert: '病虫害预警', weather_alert: '天气预警' }
  return map[t] || t
}
function statusLabel(s: string) {
  const map: Record<string, string> = { draft: '草稿', published: '已发布', expired: '已过期', archived: '已归档' }
  return map[s] || s
}
function editPolicy(p: any) { editingPolicy.value = p; form.value = { ...p }; showForm.value = true }
function deletePolicy(id: string) { adminDeletePolicy(id).then(() => location.reload()) }
async function savePolicy() {
  if (editingPolicy.value) {
    await adminUpdatePolicy(editingPolicy.value.policyId, form.value)
  } else {
    await adminCreatePolicy(form.value)
  }
  showForm.value = false
  editingPolicy.value = null
  location.reload()
}
</script>
