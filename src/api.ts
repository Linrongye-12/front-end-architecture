import axios from 'axios';
import { logout, TOKEN_KEY } from './auth'; // 新增：供 401 拦截器使用

export type Id = number | string;
export type Query = Record<string, unknown>;
export type Payload = Record<string, unknown>;

const http = axios.create({ baseURL: '/', timeout: 20000 });
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('nongceshen_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
http.interceptors.response.use((response) => response.data?.data ?? response.data);

// 新增：401 统一处理拦截器（独立挂载在原有解包拦截器之后，原有代码不变）
// token 失效/未登录时清除本地状态并跳转登录页，携带 redirect 便于登录后回跳
http.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 && !location.pathname.startsWith('/login')) {
    logout();
    location.href = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
  }
  return Promise.reject(error);
});

const get = (url: string, params?: Query) => http.get(url, { params });
const post = (url: string, data?: unknown) => http.post(url, data);
const put = (url: string, data?: unknown) => http.put(url, data);
const del = (url: string, params?: Query) => http.delete(url, { params });

/** V2.0 新增：接口封装：响应拦截器已解包为返回数据本身，这里统一以 any 处理避免 AxiosResponse 类型泛型
 *  修复：get/del 第二个参数接收 axios 配置对象（调用方传进的即 { params }），直接透传给 http。
 *  原先在 get()/del() 再包一层 { params } 会导致查询串变成 params[key]=value，后端收不到筛选条件 */
const v2 = {
  get: (url: string, config?: Query) => http.get(url, config) as Promise<any>,
  post: (url: string, data?: unknown) => post(url, data) as Promise<any>,
  put: (url: string, data?: unknown) => put(url, data) as Promise<any>,
  del: (url: string, config?: Query) => http.delete(url, config) as Promise<any>
};

/** API V1.0：与《农策审_完整API接口文档_V1.0》保持一致。 */
export const api = {
  // 第一部分：农策审前台接口
  auth: {
    wechatLogin: (data: { code: string }) => post('/api/auth/wechat/login', data),
    adminLogin: (data: { username: string; password: string }) => post('/api/auth/admin/login', data),
    logout: () => post('/api/auth/logout'),
    me: () => get('/api/auth/me')
  },
  user: {
    info: () => get('/api/user/info'),
    updateInfo: (data: Payload) => put('/api/user/info', data)
  },
  planting: {
    uploadDoc: (data: FormData) => post('/api/planting/upload', data),
    submitPrediction: (data: Payload) => post('/api/planting/predict', data),
    queryResult: (params: Query) => get('/api/planting/result', params),
    submitMissing: (data: Payload) => post('/api/planting/missing-info', data),
    getReport: (params: Query) => get('/api/planting/report', params),
    submitFeedback: (data: Payload) => post('/api/planting/feedback', data),
    history: (params: Query = {}) => get('/api/planting/history', params)
  },
  session: {
    list: () => get('/api/sessions')
  },
  prompt: {
    tips: () => get('/api/prompt/tips')
  },

  // 第二部分：后台管理接口
  admin: {
    knowledge: {
      list: (params: Query = {}) => get('/api/admin/knowledge', params),
      create: (data: Payload) => post('/api/admin/knowledge', data),
      update: (id: Id, data: Payload) => put(`/api/admin/knowledge/${id}`, data),
      remove: (id: Id) => del(`/api/admin/knowledge/${id}`)
    },
    rebuildIndex: () => post('/api/admin/knowledge/rebuild-index'),
    users: {
      list: (params: Query = {}) => get('/api/admin/users', params),
      detail: (id: Id) => get(`/api/admin/users/${id}`)
    },
    agentLogs: (params: Query = {}) => get('/api/admin/agent-logs', params),
    statistics: () => get('/api/admin/statistics'),
    promptTemplates: {
      list: () => get('/api/admin/prompt-templates'),
      update: (data: Payload) => put('/api/admin/prompt-templates', data)
    },
    systemParams: {
      get: () => get('/api/admin/system-params'),
      update: (data: Payload) => put('/api/admin/system-params', data)
    }
  },

  // 第三部分：Agent平台接口（内部调用）
  agent: {
    startPrediction: (data: Payload) => post('/api/agent/predict', data),
    callback: (data: Payload) => post('/api/agent/callback', data),
    status: (params: Query) => get('/api/agent/status', params)
  }
};

export function listFrom(result: any): any[] {
  if (Array.isArray(result)) return result;
  return result?.records ?? result?.list ?? result?.items ?? result?.content ?? [];
}

// ==================== 新增功能 API（V2.0） ====================

// --- 政策动态中心 ---
export const getPolicies = (params: Query = {}) => v2.get('/api/v1/policies', { params });
export const getPolicyDetail = (policyId: string) => v2.get(`/api/v1/policies/${policyId}`);
export const getAlerts = (params: Query = {}) => v2.get('/api/v1/alerts', { params });
export const policyCheck = (reviewId: string, data: unknown) => v2.post(`/api/v1/reviews/${reviewId}/policy-check`, data);

// --- 知识学院 ---
export const getAcademyClasses = (params: Query = {}) => v2.get('/api/v1/academy/classes', { params });
export const academyAiChat = (data: unknown) => v2.post('/api/v1/academy/ai-chat', data);
export const getAcademyVideos = (params: Query = {}) => v2.get('/api/v1/academy/videos', { params });
export const aiQuestion = (data: unknown) => v2.post('/api/v1/academy/ai-question', data);

// --- 案例库 ---
export const getCases = (params: Query = {}) => v2.get('/api/v1/cases', { params });
export const getCaseDetail = (caseId: string) => v2.get(`/api/v1/cases/${caseId}`);
export const recommendCases = (data: unknown) => v2.post('/api/v1/cases/recommend', data);
export const comparePlan = (caseId: string) => v2.get(`/api/v1/cases/${caseId}/compare`);

// --- 智能问答 ---
export const qaChat = (data: unknown) => v2.post('/api/v1/qa/chat', data);
export const qaIntent = (data: unknown) => v2.post('/api/v1/qa/intent', data);
export const qaKnowledgeSearch = (data: unknown) => v2.post('/api/v1/qa/knowledge-search', data);
export const qaSafetyFilter = (data: unknown) => v2.post('/api/v1/qa/safety-filter', data);

// --- 管理后台（V2.0 新增） ---
export const adminCreatePolicy = (data: unknown) => v2.post('/api/v1/admin/policies', data);
export const adminUpdatePolicy = (policyId: string, data: unknown) => v2.put(`/api/v1/admin/policies/${policyId}`, data);
export const adminDeletePolicy = (policyId: string) => v2.del(`/api/v1/admin/policies/${policyId}`);
export const adminCreateClass = (data: unknown) => v2.post('/api/v1/admin/academy/classes', data);
export const adminCreateVideo = (data: unknown) => v2.post('/api/v1/admin/academy/videos', data);
export const adminCreateCase = (data: unknown) => v2.post('/api/v1/admin/cases', data);
export const adminUpdateRecommendStrategy = (data: unknown) => v2.put('/api/v1/admin/cases/recommend-strategy', data);
export const adminCreateFaq = (data: unknown) => v2.post('/api/v1/admin/qa/entries', data);
export const adminManageIntentTags = (data: unknown) => v2.put('/api/v1/admin/qa/intent-tags', data);

// --- 管理后台（V2.0 新增：列表查询与编辑/删除，路径按 REST 约定，需后端同步实现） ---
export const getAdminFaqs = (params: Query = {}) => v2.get('/api/v1/admin/qa/entries', { params });
export const getAdminIntentTags = (params: Query = {}) => v2.get('/api/v1/admin/qa/intent-tags', { params });
export const adminUpdateCase = (caseId: string, data: unknown) => v2.put(`/api/v1/admin/cases/${caseId}`, data);
export const adminDeleteCase = (caseId: string) => v2.del(`/api/v1/admin/cases/${caseId}`);
export const adminUpdateClass = (classId: string, data: unknown) => v2.put(`/api/v1/admin/academy/classes/${classId}`, data);
export const adminDeleteClass = (classId: string) => v2.del(`/api/v1/admin/academy/classes/${classId}`);
export const adminUpdateVideo = (videoId: string, data: unknown) => v2.put(`/api/v1/admin/academy/videos/${videoId}`, data);
export const adminDeleteVideo = (videoId: string) => v2.del(`/api/v1/admin/academy/videos/${videoId}`);
export const adminUpdateFaq = (faqId: string, data: unknown) => v2.put(`/api/v1/admin/qa/entries/${faqId}`, data);
export const adminDeleteFaq = (faqId: string) => v2.del(`/api/v1/admin/qa/entries/${faqId}`);

// ==================== 以下为本次补全新增（不改动上方任何原有代码） ====================

/** 新增：从任意异常中提取可展示的错误信息，供各页面 catch 后统一使用 */
export function errMessage(err: any): string {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.msg ||
    (err?.code === 'ECONNABORTED' ? '请求超时，请稍后重试' : '') ||
    err?.message ||
    '请求失败，请稍后重试'
  );
}

/** 新增：带上传进度的文档上传（大文件超时单独放宽到 60s），原有 api.planting.uploadDoc 保留不变 */
export function uploadDocWithProgress(
  data: FormData,
  onProgress?: (percent: number) => void
): Promise<any> {
  return http.post('/api/planting/upload', data, {
    timeout: 60000,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e: any) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    }
  }) as Promise<any>;
}

/** 新增：提交预测（耗时任务，超时放宽到 60s），原有 api.planting.submitPrediction 保留不变 */
export function submitPredictionLong(data: Payload): Promise<any> {
  return http.post('/api/planting/predict', data, { timeout: 60000 }) as Promise<any>;
}

/** 新增：re-export 存储 key 常量，方便页面统一引用（也保证上方新增的 import 有使用） */
export { TOKEN_KEY };
