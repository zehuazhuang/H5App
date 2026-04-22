import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    //帖子相关
    {
      path: '/picPostDetails/:postId',
      name: 'picPostDetails',
      component: () => import('../views/postViews/picPostDetails.vue'),
      props: true
    },
    {
      path: '/videoPostDetails/:postId',
      name: 'videoPostDetails',
      component: () => import('../views/postViews/videoPostDetails.vue'),
      props: true
    },
    {
      path: '/publishPicPost',
      name: 'publishPicPost',
      component: () => import('../views/postViews/publishPicPost.vue'),
    },
    {
      path: '/publishVideoPost',
      name: 'publishVideoPost',
      component: () => import('../views/postViews/publishVideoPost.vue'),
    },
    //聊天相关
    {
      path: '/chat/:chatId',
      name: 'chat',
      component: () => import('../views/messageViews/chat.vue'),
      props: true
    },
    {
      path: '/otherHome/:userId',
      name: 'otherHome',
      component: () => import('../views/messageViews/otherHome.vue'),
      props: true
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/messageViews/report.vue'),
    },
    //Ai相关
    {
      path: '/aiDetails',
      name: 'aiDetails',
      component: () => import('../views/aiViews/aiDetails.vue'),
    },
    {
      path: '/aiChat',
      name: 'aiChat',
      component: () => import('../views/aiViews/aiChat.vue'),
    },
    //个人相关
    {
      path: '/setting',
      name: 'setting',
      component: () => import('../views/mineViews/setting.vue'),
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import('../views/mineViews/edit.vue'),
    },
    {
      path: '/newsignup',
      name: 'newsignup',
      component: () => import('../views/mineViews/newsignup.vue'),
    },
    {
      path: '/follow',
      name: 'follow',
      component: () => import('../views/mineViews/follow.vue'),
    },
    {
      path: '/fan',
      name: 'fan',
      component: () => import('../views/mineViews/fan.vue'),
    },
    {
      path: '/block',
      name: 'block',
      component: () => import('../views/mineViews/block.vue'),
    },
    {
      path: '/coins',
      name: 'coins',
      component: () => import('../views/mineViews/coins.vue'),
    },
    {
      path: '/userAgreement',
      name: 'userAgreement',
      component: () => import('../views/mineViews/userAgreement.vue'),
    },
    {
      path: '/privacyPolicy',
      name: 'privacyPolicy',
      component: () => import('../views/mineViews/privacyPolicy.vue'),
    },
  ],
})

export default router
