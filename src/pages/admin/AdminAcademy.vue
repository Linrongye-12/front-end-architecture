<template>
  <div class="admin-academy">
    <h2>知识学院管理</h2>
    <div class="tabs">
      <button :class="{ active: tab === 'classes' }" @click="tab = 'classes'">课程管理</button>
      <button :class="{ active: tab === 'videos' }" @click="tab = 'videos'">视频管理</button>
    </div>
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <div v-if="tab === 'classes'" class="tab-content">
      <button class="btn-primary" @click="openClassCreate">新增课程</button>
      <table>
        <thead><tr><th>标题</th><th>分类</th><th>难度</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="c in classes" :key="c.classId">
            <td>{{ c.title }}</td><td>{{ classTypeLabel(c.classType) }}</td><td>{{ c.difficulty }}</td><td>{{ c.status }}</td>
            <td><button @click="openClassEdit(c)">编辑</button><button @click="removeClass(c)">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="tab === 'videos'" class="tab-content">
      <button class="btn-primary" @click="openVideoCreate">新增视频</button>
      <table>
        <thead><tr><th>标题</th><th>专家</th><th>时长</th><th>播放量</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="v in videos" :key="v.videoId">
            <td>{{ v.title }}</td><td>{{ v.expertName }}</td><td>{{ v.duration }}秒</td><td>{{ v.viewCount }}</td><td>{{ v.status }}</td>
            <td><button @click="openVideoEdit(v)">编辑</button><button @click="removeVideo(v)">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showClassForm" class="modal">
      <div class="modal-content">
        <h3>{{ editingClassId ? '编辑课程' : '新增课程' }}</h3>
        <form @submit.prevent="saveClass">
          <input v-model="classForm.title" placeholder="课程标题" required />
          <select v-model="classForm.classType">
            <option value="beginner">新手课堂</option><option value="ai">AI课堂</option><option value="expert">专家课堂</option>
          </select>
          <select v-model.number="classForm.difficulty">
            <option :value="1">入门</option><option :value="2">进阶</option><option :value="3">高级</option>
          </select>
          <textarea v-model="classForm.description" placeholder="课程简介" rows="3"></textarea>
          <div class="form-actions">
            <button type="submit" :disabled="saving">保存</button>
            <button type="button" @click="showClassForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showVideoForm" class="modal">
      <div class="modal-content">
        <h3>{{ editingVideoId ? '编辑视频' : '新增视频' }}</h3>
        <form @submit.prevent="saveVideo">
          <input v-model="videoForm.title" placeholder="视频标题" required />
          <input v-model="videoForm.expertName" placeholder="专家姓名" required />
          <input v-model="videoForm.expertTitle" placeholder="专家头衔" />
          <input v-model.number="videoForm.duration" type="number" placeholder="时长(秒)" />
          <input v-model="videoForm.videoUrl" placeholder="视频地址" />
          <div class="form-actions">
            <button type="submit" :disabled="saving">保存</button>
            <button type="button" @click="showVideoForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getAcademyClasses, getAcademyVideos,
  adminCreateClass, adminUpdateClass, adminDeleteClass,
  adminCreateVideo, adminUpdateVideo, adminDeleteVideo,
  listFrom, errMessage
} from '../../api'

const tab = ref('classes')
const classes = ref<any[]>([])
const videos = ref<any[]>([])
const error = ref('')
const msg = ref('')
const saving = ref(false)

const showClassForm = ref(false)
const editingClassId = ref('')
const classForm = ref({ title: '', classType: 'beginner', difficulty: 1, description: '' })

const showVideoForm = ref(false)
const editingVideoId = ref('')
const videoForm = ref({ title: '', expertName: '', expertTitle: '', duration: 0, videoUrl: '' })

function classTypeLabel(t: string) { const m: Record<string, string> = { beginner: '新手课堂', ai: 'AI课堂', expert: '专家课堂' }; return m[t] || t }

async function loadAll() {
  error.value = ''
  try {
    const [clsRes, vidRes] = await Promise.all([
      getAcademyClasses({ page: 1, pageSize: 100 }),
      getAcademyVideos({ page: 1, pageSize: 100 })
    ])
    classes.value = listFrom(clsRes)
    videos.value = listFrom(vidRes)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

function openClassCreate() {
  editingClassId.value = ''
  classForm.value = { title: '', classType: 'beginner', difficulty: 1, description: '' }
  showClassForm.value = true
}
function openClassEdit(c: any) {
  editingClassId.value = c.classId
  classForm.value = { title: c.title, classType: c.classType, difficulty: c.difficulty ?? 1, description: c.description ?? '' }
  showClassForm.value = true
}
async function saveClass() {
  saving.value = true
  error.value = ''; msg.value = ''
  try {
    if (editingClassId.value) {
      await adminUpdateClass(editingClassId.value, classForm.value)
      msg.value = '保存成功'
    } else {
      await adminCreateClass(classForm.value)
      msg.value = '新增成功'
    }
    showClassForm.value = false
    await loadAll()
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  } finally {
    saving.value = false
  }
}
async function removeClass(c: any) {
  if (!confirm(`确定删除课程「${c.title}」吗？`)) return
  error.value = ''; msg.value = ''
  try {
    await adminDeleteClass(c.classId)
    msg.value = '删除成功'
    classes.value = classes.value.filter(i => i.classId !== c.classId)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

function openVideoCreate() {
  editingVideoId.value = ''
  videoForm.value = { title: '', expertName: '', expertTitle: '', duration: 0, videoUrl: '' }
  showVideoForm.value = true
}
function openVideoEdit(v: any) {
  editingVideoId.value = v.videoId
  videoForm.value = { title: v.title, expertName: v.expertName, expertTitle: v.expertTitle ?? '', duration: v.duration ?? 0, videoUrl: v.videoUrl ?? '' }
  showVideoForm.value = true
}
async function saveVideo() {
  saving.value = true
  error.value = ''; msg.value = ''
  try {
    if (editingVideoId.value) {
      await adminUpdateVideo(editingVideoId.value, videoForm.value)
      msg.value = '保存成功'
    } else {
      await adminCreateVideo(videoForm.value)
      msg.value = '新增成功'
    }
    showVideoForm.value = false
    await loadAll()
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  } finally {
    saving.value = false
  }
}
async function removeVideo(v: any) {
  if (!confirm(`确定删除视频「${v.title}」吗？`)) return
  error.value = ''; msg.value = ''
  try {
    await adminDeleteVideo(v.videoId)
    msg.value = '删除成功'
    videos.value = videos.value.filter(i => i.videoId !== v.videoId)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
}

onMounted(loadAll)
</script>
