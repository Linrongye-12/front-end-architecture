<template>
  <div class="ai-chat">
    <h2>AI互动课堂</h2>
    <div class="chat-container">
      <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
        <div class="bubble">{{ msg.content }}</div>
      </div>
    </div>
    <div class="input-bar">
      <input v-model="question" @keyup.enter="sendQuestion" placeholder="输入你的农业问题..." />
      <button @click="sendQuestion">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { academyAiChat, errMessage } from '../../api'

const question = ref('')
const messages = ref<any[]>([])

async function sendQuestion() {
  if (!question.value.trim()) return
  messages.value.push({ role: 'user', content: question.value })
  const text = question.value
  question.value = ''
  try {
    const res = await academyAiChat({ question: text })
    messages.value.push({ role: 'assistant', content: res.answer })
  } catch (err) {
    console.error(err)
    messages.value.push({ role: 'assistant', content: '抱歉，请求失败：' + errMessage(err) })
  }
}
</script>

<style scoped>
/* 视觉升级：套用全站设计系统（自然绿气泡 + 圆角 + 柔和阴影），功能与脚本不变 */
.ai-chat { max-width: 800px; margin: 0 auto; padding: 0; }
.ai-chat h2 { margin-bottom: 16px; font-size: 20px; }
.chat-container { height: 420px; overflow-y: auto; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--card); box-shadow: var(--shadow-sm); }
.message { margin: 10px 0; display: flex; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }
.bubble { max-width: 72%; padding: 11px 16px; border-radius: 18px; line-height: 1.6; font-size: 14px; }
.message.user .bubble { background: var(--green); color: #fff; border-bottom-right-radius: 6px; }
.message.assistant .bubble { background: var(--bg-soft); color: var(--ink); border-bottom-left-radius: 6px; }
.input-bar { display: flex; gap: 10px; margin-top: 14px; }
.input-bar input { flex: 1; padding: 12px 16px; border: 1px solid var(--line); border-radius: 999px; }
.input-bar button { padding: 12px 26px; background: var(--green); color: #fff; border: none; border-radius: 999px; cursor: pointer; font-weight: 600; }
.input-bar button:hover { background: var(--green-deep); }
</style>
