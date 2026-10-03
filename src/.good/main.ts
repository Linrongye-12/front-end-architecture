import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue';
import Prediction from './pages/Prediction.vue';
import History from './pages/History.vue';
import Report from './pages/Report.vue';
import PolicyList from './pages/policy/PolicyList.vue';
import PolicyDetail from './pages/policy/PolicyDetail.vue';
import AcademyHome from './pages/academy/AcademyHome.vue';
import AiChat from './pages/academy/AiChat.vue';
import CaseList from './pages/cases/CaseList.vue';
import CaseDetail from './pages/cases/CaseDetail.vue';
import QaPage from './pages/qa/QaPage.vue';
import AdminLayout from './pages/admin/AdminLayout.vue';
import AdminDashboard from './pages/admin/AdminDashboard.vue';
import AdminUsers from './pages/admin/AdminUsers.vue';
import AdminKnowledge from './pages/admin/AdminKnowledge.vue';
import AdminAgentLogs from './pages/admin/AdminAgentLogs.vue';
import AdminSettings from './pages/admin/AdminSettings.vue';
import AdminPolicy from './pages/admin/AdminPolicy.vue';
import AdminAcademy from './pages/admin/AdminAcademy.vue';
import AdminCases from './pages/admin/AdminCases.vue';
import AdminQa from './pages/admin/AdminQa.vue';
import { isAdmin, isLoggedIn } from './auth';
import './styles.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/home', redirect: '/' },
    { path: '/prediction', component: Prediction, meta: { requiresAuth: true } },
    { path: '/history', component: History, meta: { requiresAuth: true } },
    { path: '/report/:id', component: Report, meta: { requiresAuth: true } },
    { path: '/policy', component: PolicyList },
    { path: '/policy/:id', component: PolicyDetail },
    { path: '/academy', component: AcademyHome },
    { path: '/academy/ai-chat', component: AiChat },
    { path: '/cases', component: CaseList },
    { path: '/cases/:id', component: CaseDetail },
    { path: '/qa', component: QaPage },
    { path: '/login', component: Login, meta: { layout: 'auth' } },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { layout: 'admin', requiresAdmin: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', component: AdminDashboard, meta: { layout: 'admin', requiresAdmin: true, title: '数据总览' } },
        { path: 'users', component: AdminUsers, meta: { layout: 'admin', requiresAdmin: true, title: '用户管理' } },
        { path: 'knowledge', component: AdminKnowledge, meta: { layout: 'admin', requiresAdmin: true, title: '知识库管理' } },
        { path: 'agent-logs', component: AdminAgentLogs, meta: { layout: 'admin', requiresAdmin: true, title: 'Agent日志' } },
        { path: 'settings', component: AdminSettings, meta: { layout: 'admin', requiresAdmin: true, title: '系统配置' } },
        { path: 'policy', component: AdminPolicy, meta: { layout: 'admin', requiresAdmin: true, title: '政策管理' } },
        { path: 'academy', component: AdminAcademy, meta: { layout: 'admin', requiresAdmin: true, title: '知识学院管理' } },
        { path: 'cases', component: AdminCases, meta: { layout: 'admin', requiresAdmin: true, title: '案例库管理' } },
        { path: 'qa', component: AdminQa, meta: { layout: 'admin', requiresAdmin: true, title: '问答管理' } }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior: () => ({ top: 0 })
});

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !isAdmin.value)
    return { path: '/login', query: { redirect: to.fullPath } };
  if (to.meta.requiresAuth && !isLoggedIn.value)
    return { path: '/login', query: { redirect: to.fullPath } };
});

// 新增：根据路由 meta.title 同步浏览器标题（admin 子路由已有 title）
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 农策审` : '农策审 - 农业智能决策平台';
});

createApp(App).use(router).mount('#app');
