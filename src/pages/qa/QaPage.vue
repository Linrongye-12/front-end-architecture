<template>
  <div class="qa-page">
    <div class="sidebar">
      <button class="new-chat-btn" @click="newChat">+ 新对话</button>
      <div v-for="s in sessions" :key="s.sessionId" class="session-item" :class="{ active: s.sessionId === currentSessionId }" @click="switchSession(s.sessionId)">
        {{ s.title }}
      </div>
    </div>
    <div class="chat-main">
      <div class="chat-header">
        <h2>农业智能问答</h2>
      </div>
      <div class="chat-messages" ref="msgContainer">
        <div v-if="messages.length === 0" class="welcome">
          <p>你好！我是农业智能助手</p>
          <p>可以问我任何农业相关问题...</p>
          <div class="quick-questions">
            <span v-for="q in ['玉米什么时候追肥？', '大豆需要什么土壤？', '农药如何配比？']" :key="q" @click="sendQuestion(q)">{{ q }}</span>
          </div>
        </div>
        <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
          <div class="bubble">{{ msg.content }}</div>
        </div>
      </div>
      <div class="input-bar">
        <input v-model="question" @keyup.enter="() => sendQuestion()" placeholder="输入你的农业问题..." />
        <button @click="() => sendQuestion()">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { qaChat, errMessage } from '../../api'
import { authState } from '../../auth'

const question = ref('')
const messages = ref<any[]>([])
const sessions = ref<any[]>([])
const currentSessionId = ref('')
const msgContainer = ref<HTMLElement | null>(null)

function newChat() {
  currentSessionId.value = ''
  messages.value = []
}

function switchSession(id: string) {
  currentSessionId.value = id
  // TODO: load history
}

async function sendQuestion(q?: string) {
  const text = q || question.value
  if (!text.trim()) return
  messages.value.push({ role: 'user', content: text })
  question.value = ''
  try {
    const res = await qaChat({ question: text, userId: authState.user?.id ?? 1, sessionId: currentSessionId.value })
    messages.value.push({ role: 'assistant', content: res.answer })
    currentSessionId.value = res.sessionId
  } catch (err) {
    console.error(err)
    messages.value.push({ role: 'assistant', content: '抱歉，请求失败：' + errMessage(err) })
  } finally {
    await nextTick()
    if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}
</script>

<style scoped>
/* 视觉升级：套用全站设计系统（自然绿 + 圆角会话面板 + 磨砂质感），功能与脚本不变 */
.qa-page { display: flex; height: calc(100vh - 140px); background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-sm); }
.sidebar { width: 240px; border-right: 1px solid var(--line); padding: 16px; overflow-y: auto; background: var(--card-tint); }
.new-chat-btn { width: 100%; padding: 11px; background: var(--green); color: #fff; border: none; border-radius: 999px; cursor: pointer; margin-bottom: 14px; font-weight: 600; }
.new-chat-btn:hover { background: var(--green-deep); }
.session-item { padding: 9px 13px; border-radius: 12px; cursor: pointer; margin: 4px 0; font-size: 13.5px; color: var(--ink-2); }
.session-item:hover { background: var(--green-soft); }
.session-item.active { background: var(--green-soft); color: var(--green-deep); font-weight: 700; }
.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.chat-header { padding: 14px 22px; border-bottom: 1px solid var(--line); }
.chat-header h2 { margin: 0; font-size: 17px; }
.chat-messages { flex: 1; overflow-y: auto; padding: 18px 22px; }
.welcome { text-align: center; padding: 60px 0; color: var(--ink-2); }
.quick-questions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 18px; }
.quick-questions span { padding: 9px 18px; background: var(--bg-soft); border: 1px solid var(--line); border-radius: 999px; cursor: pointer; font-size: 13px; color: var(--ink-2); }
.quick-questions span:hover { background: var(--green-soft); border-color: var(--green); color: var(--green-deep); }
.message { margin: 10px 0; display: flex; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }
.bubble { max-width: 70%; padding: 11px 16px; border-radius: 18px; line-height: 1.6; }
.message.user .bubble { background: var(--green); color: #fff; border-bottom-right-radius: 6px; }
.message.assistant .bubble { background: var(--bg-soft); color: var(--ink); border-bottom-left-radius: 6px; }
.input-bar { display: flex; gap: 10px; padding: 14px 22px; border-top: 1px solid var(--line); }
.input-bar input { flex: 1; padding: 12px 16px; border: 1px solid var(--line); border-radius: 999px; }
.input-bar button { padding: 12px 26px; background: var(--green); color: #fff; border: none; border-radius: 999px; cursor: pointer; font-weight: 600; }
.input-bar button:hover { background: var(--green-deep); }
@media (max-width: 768px) {
  .qa-page { flex-direction: column; height: calc(100vh - 160px); }
  .sidebar { width: 100%; height: 130px; border-right: none; border-bottom: 1px solid var(--line); }
}
</style>
