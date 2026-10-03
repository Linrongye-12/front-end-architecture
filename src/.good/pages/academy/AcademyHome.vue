<template>
  <div class="academy-home">
    <div class="banner">
      <h1>农业知识学院</h1>
      <p>从新手到专家，一站式农业知识学习平台</p>
    </div>
    <p v-if="error" class="form-error">{{ error }}</p>
    <div class="section">
      <h2>新手课堂</h2>
      <div class="card-grid">
        <div v-for="c in beginnerClasses" :key="c.classId" class="card" @click="goClass(c.classId)">
          <img :src="c.coverImage || '/placeholder.png'" alt="" />
          <h3>{{ c.title }}</h3>
          <p>{{ c.difficulty === 1 ? '入门' : c.difficulty === 2 ? '进阶' : '高级' }}</p>
        </div>
      </div>
    </div>
    <div class="section">
      <h2>AI互动课堂</h2>
      <p>向AI提问农业知识，即时获得专业解答</p>
      <router-link to="/academy/ai-chat" class="btn">开始AI问答</router-link>
    </div>
    <div class="section">
      <h2>专家视频课程</h2>
      <div class="card-grid">
        <div v-for="v in videos" :key="v.videoId" class="card" @click="goVideo(v.videoId)">
          <img :src="v.coverImage || '/placeholder.png'" alt="" />
          <h3>{{ v.title }}</h3>
          <p>{{ v.expertName }} | {{ v.expertTitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAcademyClasses, getAcademyVideos, listFrom, errMessage } from '../../api'

const router = useRouter()
const beginnerClasses = ref<any[]>([])
const videos = ref<any[]>([])
const error = ref('')

onMounted(async () => {
  error.value = ''
  try {
    const [clsRes, vidRes] = await Promise.all([
      getAcademyClasses({ page: 1, pageSize: 4, classType: 'beginner' }),
      getAcademyVideos({ page: 1, pageSize: 4 })
    ])
    beginnerClasses.value = listFrom(clsRes)
    videos.value = listFrom(vidRes)
  } catch (err) {
    console.error(err)
    error.value = errMessage(err)
  }
})

function goClass(id: string) { router.push(`/academy/class/${id}`) }
function goVideo(id: string) { router.push(`/academy/video/${id}`) }
</script>

<style scoped>
/* 视觉升级：紫色横幅 → 自然绿温室实景 + 磨砂叠加；卡片圆角阴影统一 */
.academy-home { padding: 0; }
.banner {
  text-align: left; padding: 44px; color: #fff; border-radius: var(--radius-xl); margin-bottom: 28px;
  background:
    linear-gradient(105deg, rgba(94, 148, 50, .88) 0%, rgba(139, 195, 74, .72) 100%),
    url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&q=80&auto=format&fit=crop') center / cover no-repeat;
  box-shadow: var(--shadow);
}
.banner h1 { margin: 0; color: #fff; font-size: 30px; font-weight: 800; }
.banner p { margin: 10px 0 0; opacity: .95; font-size: 14.5px; }
.section { margin-bottom: 36px; }
.section h2 { border-left: 4px solid var(--green); padding-left: 12px; font-size: 19px; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; box-shadow: var(--shadow-sm); transition: transform .18s, box-shadow .2s; }
.card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.card img { width: 100%; height: 140px; object-fit: cover; background: var(--bg-soft); }
.card h3 { margin: 12px 14px 4px; font-size: 14.5px; }
.card p { margin: 0 14px 14px; color: var(--ink-3); font-size: 12px; }
.btn { display: inline-block; padding: 11px 26px; background: var(--green); color: #fff; border-radius: 999px; text-decoration: none; font-weight: 600; box-shadow: var(--shadow-sm); transition: background .2s; }
.btn:hover { background: var(--green-deep); }
</style>
