import { computed, reactive } from 'vue';

type UserInfo = { id?: number; username?: string; nickname?: string; role?: string };

/** 新增：统一存储 key，避免各处硬编码字符串（原有代码中的字面量保持不变，值一致） */
export const TOKEN_KEY = 'nongceshen_token';
export const USER_KEY = 'nongceshen_user';

const savedUser = localStorage.getItem('nongceshen_user');
/** 新增：容错解析本地缓存的用户信息，数据损坏时返回 null 而不是让整个应用启动崩溃 */
function parseSavedUser(raw: string | null): UserInfo | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as UserInfo) : null;
  } catch {
    localStorage.removeItem('nongceshen_user');
    return null;
  }
}
export const authState = reactive<{ token: string; user: UserInfo | null }>({
  token: localStorage.getItem('nongceshen_token') || '',
  user: parseSavedUser(savedUser)
});

export const isLoggedIn = computed(() => Boolean(authState.token));
export const isAdmin = computed(() =>
  ['ADMIN', 'MERCHANT_ADMIN'].includes(authState.user?.role || '')
);

export function setLogin(token: string, user: UserInfo) {
  authState.token = token;
  authState.user = user;
  localStorage.setItem('nongceshen_token', token);
  localStorage.setItem('nongceshen_user', JSON.stringify(user));
}

export function logout() {
  authState.token = '';
  authState.user = null;
  localStorage.removeItem('nongceshen_token');
  localStorage.removeItem('nongceshen_user');
}

/** 新增：局部更新用户信息（如个人中心修改昵称后同步本地缓存），不影响原有 setLogin/logout */
export function updateUser(patch: Partial<UserInfo>) {
  authState.user = { ...(authState.user || {}), ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(authState.user));
}
