<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router'; // 新增：读取 redirect 查询参数
import { api } from '../api';
import { errMessage } from '../api'; // 新增：统一错误提示
import { setLogin } from '../auth';
const router = useRouter();
const route = useRoute(); // 新增
const isWechat = ref(true);
const code = ref('');
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(''); // 新增：登录错误提示

// 新增：登录成功后回跳到守卫记录的来源页，无 redirect 时保持原有默认跳转
function redirectAfterLogin(fallback: string) {
  const target = route.query.redirect;
  router.push(typeof target === 'string' && target.startsWith('/') ? target : fallback);
}

async function handleWechatLogin() {
  if (!code.value) return;
  loading.value = true;
  error.value = ''; // 新增
  try {
    const res: any = await api.auth.wechatLogin({ code: code.value });
    setLogin(res.token, res.user);
    redirectAfterLogin('/'); // 补全：原为 router.push('/')，无 redirect 时行为不变
  } catch (err) {
    console.error(err);
    error.value = errMessage(err); // 新增
  } finally {
    loading.value = false;
  }
}

async function handleAdminLogin() {
  if (!username.value || !password.value) return;
  loading.value = true;
  error.value = ''; // 新增
  try {
    const res: any = await api.auth.adminLogin({ username: username.value, password: password.value });
    setLogin(res.token, res.user);
    redirectAfterLogin('/admin'); // 补全：原为 router.push('/admin')，无 redirect 时行为不变
  } catch (err) {
    console.error(err);
    error.value = errMessage(err); // 新增
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div class="login-page">
    <div class="login-card">
      <h2>农策审登录</h2>
      <div class="login-tabs">
        <button :class="{ active: isWechat }" @click="isWechat = true">微信登录</button>
        <button :class="{ active: !isWechat }" @click="isWechat = false">管理员登录</button>
      </div>
      <p v-if="error" class="form-error">{{ error }}</p>
      <div v-if="isWechat" class="login-form">
        <input v-model="code" placeholder="微信授权 code" @keyup.enter="handleWechatLogin" />
        <button @click="handleWechatLogin" :disabled="loading || !code">
          {{ loading ? '登录中...' : '微信登录' }}
        </button>
      </div>
      <div v-else class="login-form">
        <input v-model="username" placeholder="管理员账号" @keyup.enter="handleAdminLogin" />
        <input v-model="password" type="password" placeholder="密码" @keyup.enter="handleAdminLogin" />
        <button @click="handleAdminLogin" :disabled="loading || !username || !password">
          {{ loading ? '登录中...' : '管理员登录' }}
        </button>
      </div>
    </div>
  </div>
</template>
