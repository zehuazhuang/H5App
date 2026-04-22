<template>
  <div class="page">
    <!-- 头像背景 -->
    <div class="avatar-bg" :style="{ '--avatar-url': `url(${currentUser.avator})` }"></div>
    <!-- 可滑动内容 -->
    <div class="scroll-content">
      <div class="top">
        <div class="top-avatar" :style="{ '--avatar-url': `url(${currentUser.avator})` }">
            <div class="follow-btn" v-if="userId !== currentUserStore.currentUser.userId && !currentUserStore.currentUser.follow.includes(userId)" @click="handleFollow" >
                <div class="follow-icon"></div>
            </div> 
        </div>
      </div>
      <div class="top-name">{{ currentUser.name }}</div>
      <!-- 用户作品数量、粉丝、关注 -->
      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-number">{{ userPosts.length || 0 }}</div>
          <div class="stat-label">Works</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ currentUser.fans.length || 0 }}</div>
          <div class="stat-label">Fans</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ currentUser.follow.length || 0 }}</div>
          <div class="stat-label">Follow</div>
        </div>
      </div>
      <!-- 简介和chat按钮 -->
      <div class="intro-chat">
        <div class="intro-text">{{ currentUser.about }}</div>
        <template v-if="userId !== currentUserStore.currentUser.userId">
          <div class="chat-btn" @click="handleChat">
              <div class="chat-icon"></div>
              <div class="chat-text">Chat</div>
          </div>
        </template>
        <template v-else>
          <div class="chat-btn-hidden"></div>
        </template>
      </div>
      <!-- Post标题 -->
      <div class="post-title">Post</div>
      <!-- PostList -->
      <div class="post-list">
        <template v-if="userPosts.length > 0">
          <div class="post-item" v-for="post in userPosts" :key="post.dynamicId" @click="toPostDetail(post.dynamicId, post.dynamicType)">
            <div class="post-content">
              <!-- Top row: avatar + name (left) and report button (right) -->
              <div class="post-top">
                  <div class="post-user">
                  <div class="post-avatar">
                    <div class="post-avatar-img" :style="{ backgroundImage: `url(${currentUser.avator})` }"></div>
                  </div>
                  <div class="post-username" :title="currentUser.name">{{ currentUser.name }}</div>
                  </div>
                  <div class="post-report" v-if="userId !== currentUserStore.currentUser.userId" @click.stop="openReportDialog"></div>
              </div>
              <!-- Middle image -->
              <div class="post-image" :style="{ backgroundImage: `url(${post.dynamicPic[0]})` }">
                <div class="post-image-overlay">
                  <div class="overlay-item">
                    <div class="overlay-icon overlay-like"></div>
                    <div class="overlay-count">{{ post.dynamicLikeCount || 0 }}</div>
                  </div>
                  <div class="overlay-item">
                    <div class="overlay-icon overlay-comment"></div>
                    <div class="overlay-count">{{ post.dynamicCommentCount || 0 }}</div>
                  </div>
                </div>
              </div>
              <!-- Bottom: post type -->
              <div class="post-type"># {{ otherStore.getTagByIndex(post.dynamicTitleType) }}</div>
            </div>
          </div>
        </template>
        <template v-else>
          <Empty />
        </template>
      </div>
    </div>
    <!-- 顶部按钮 -->
    <div class="top-btn">
        <BackButton/>
        <MoreButton v-if="userId !== currentUserStore.currentUser.userId" @click="openReportDialog" />
    </div>
    <ReportDialog v-if="showReport" @close="showReport = false" @select="reportSelect" >
    </ReportDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'
import { useOtherStore } from '@/stores/other'
import { useCurrentUserStore } from '@/stores/currentUser'
import { useUIStore } from '@/stores/ui'
import { useChatsStore } from '@/stores/chat'
import BackButton from '@/components/back.vue'
import MoreButton from '@/components/more.vue'
import ReportDialog from '@/components/reportChoose.vue'
import Empty from '@/components/empty.vue'
import { goBackOrClose } from '@/utils/iosBridge'
import { requireLoginForAction } from '@/utils/guestAuth'

const { userId } = defineProps({
  userId: {
    type: [String, Number],
    required: true
  }
})
// 用户信息
const userStore = useUserStore()
const currentUser = computed(() => {
  return userStore.getUserById(userId) || {}
})
// 用户帖子列表
const postStore = usePostStore()
const userPosts = computed(() => postStore.getPostsByUserId(userId))
const otherStore =  useOtherStore()
const currentUserStore = useCurrentUserStore()
const uiStore = useUIStore()
const chatStore = useChatsStore()
const router = useRouter()

const showReport = ref(false)
function openReportDialog() {
  if (requireLoginForAction(currentUserStore, uiStore)) return

  showReport.value = true
}

function reportSelect(value) {
  showReport.value = false
  if (value === 0) {
    router.push({ name: 'report' })
  } else if (value === 1) {
    //用户选择屏蔽
    if (uiStore.loading) return
    uiStore.showLoading()

    // 用户选择屏蔽时加入 blockList
    const blockList = currentUserStore.currentUser.blockList || []

    // 不存在才加入，避免重复
    if (!blockList.includes(userId)) {
      blockList.unshift(userId)

      // 使用 userStore 公共方法同步更新当前用户并回传 iOS
      userStore.updateUser(currentUserStore.currentUser.userId, { blockList: blockList })
    }

    const delay = Math.floor(Math.random() * 1500) + 500

    setTimeout(() => {
      uiStore.hideLoading()
      uiStore.showToast('Blocking successful')

      goBackOrClose()

    }, delay)
  }
}

// Handle follow action
function handleFollow() {
  if (requireLoginForAction(currentUserStore, uiStore)) return

  const currentUserId = currentUserStore.currentUser.userId

  // Update current user's follow list
  const currentUserFollow = currentUserStore.currentUser.follow ? [...currentUserStore.currentUser.follow] : []
  if (!currentUserFollow.includes(userId)) {
    currentUserFollow.unshift(userId)
  }

  // Update post user's fans list
  const postUserFans = currentUser.fans ? [...currentUser.fans] : []
  if (!postUserFans.includes(currentUserId)) {
    postUserFans.unshift(currentUserId)
  }

  // Update current user store and user store
  userStore.updateUser(currentUserId, { follow: currentUserFollow })

  userStore.updateUser(userId, { fans: postUserFans })
  
  uiStore.showToast('Followed successfully')
}

function handleChat() {
  if (requireLoginForAction(currentUserStore, uiStore)) return

  const currentUserId = currentUserStore.currentUser.userId
  const currentUserFollow = currentUserStore.currentUser.follow || []
  const targetUser = userStore.getUserById(userId)
  const targetUserFollow = targetUser?.follow || []

  if (!currentUserFollow.includes(userId) || !targetUserFollow.includes(currentUserId)) {
    uiStore.showToast('You can only chat if you follow each other.')
    return
  }

  if (uiStore.loading) return
  uiStore.showLoading()

  // 查找是否已有 chat
  const existChat = chatStore.chat.find(chat => {
    const ids = chat.chatUserIds || []
    return ids.includes(currentUserId) && ids.includes(userId)
  })

  let chatId

  if (existChat) {
    chatId = existChat.chatId
  } else {
    // 创建新的 chat
    const newChat = {
      chatId: String(chatStore.chat.length + 1),
      chatUserIds: [currentUserId, userId],
      lastSendContent: '',
      lastSendTime: new Date().toISOString(),
      unreadMsgCount: 0,
      lastSendUserId: currentUserId
    }

    chatStore.addChat?.(newChat)
    chatId = newChat.chatId
  }

  const delay = Math.floor(Math.random() * 1500) + 500

  setTimeout(() => {
    uiStore.hideLoading()
    // 跳转聊天页
    router.push({
      name: 'chat',
      params: { chatId: chatId }
    })

  }, delay)
}

//详情
function toPostDetail(dynamicId, dynamicType) {
  if (dynamicType == 0) {
    router.push({
      name: 'picPostDetails',
      params: { postId: dynamicId }   // ✅ 注意这里是 postId
    })
  }
  if (dynamicType == 1) {
    router.push({
      name: 'videoPostDetails',
      params: { postId: dynamicId }   // ✅ 同样修改
    })
  }
}
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 1);
  overflow: hidden;
}

.avatar-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw; /* 375px in design, scale to screen width */
  height: calc(100vh * 348 / 812); /* 348px scaled */
  opacity: 1;
  background-image: linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.14)), var(--avatar-url);
  background-size: cover; /* 等比缩放覆盖 */
  background-position: center; /* 居中显示 */
  background-repeat: no-repeat;
  pointer-events: none;
}

.scroll-content {
  position: relative;
  padding-top: calc(100vh * 72 / 812); /* 自适应顶部间距 */
  width: 100vw;
  height: calc(100vh - calc(100vh * 72 / 812));
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.top {
    display: flex;
    justify-content: center;
}

.top-avatar {
  width: calc(100vw * 66 / 375); /* 可以根据需要调整 */
  height: calc(100vw * 66 / 375);
  border-radius: 50%;
  padding: calc(100vw * 2 / 375); /* 给渐变边框留空间 */
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%); /* 外渐变 */
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.top-avatar::before {
  content: '';
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-image: var(--avatar-url);
  background-size: cover;
  background-position: center;
}

.follow-btn {
  position: absolute;
  bottom: calc(-100vh * 4 / 812); /* 超出头像底部4 */
  width: calc(100vw * 36 / 375);
  height: calc(100vh * 14 / 812);
  border-radius: calc(100vw * 40 / 375);
  background: rgba(255, 255, 255, 1);
  box-shadow: inset -1px -1px 1px rgba(255, 255, 255, 0.6), inset 1px 1px 1px rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.follow-icon {
  width: calc(100vw * 12 / 375);
  height: calc(100vw * 12 / 375);
  background-image: url('@/assets/follow.png');
  background-size: cover; /* 等比缩放覆盖 */
  background-position: center; /* 居中显示 */
  background-repeat: no-repeat;
  overflow: hidden;
}

.top-name {
  padding: calc(100vh * 12 / 812) calc(100vw * 20 / 375) 0;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  line-height: calc(100vw * 23.1 / 375);
  font-family: 'YesevaOne', sans-serif;
  color: rgba(255, 255, 255, 1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
  margin-top: calc(100vh * 8 / 812); /* 可根据需求调整与头像间距 */
}

/* 用户作品数量、粉丝、关注样式 */
.user-stats {
  display: flex;
  justify-content: center;
  gap: calc(100vw * 60 / 375); /* 三个内容间距60 */
  margin-top: calc(100vh * 16 / 812); /* 顶部间距16 */
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(100vh * 6 / 812); /* 上下结构间距6 */
  width: calc(100vw * 62 / 375);
}

.stat-number {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  line-height: calc(100vw * 23.1 / 375);
  color: rgba(255, 255, 255, 1);
}

.stat-label {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  color: rgba(255, 255, 255, 1);
}

.intro-chat {
  display: flex;
  justify-content: space-between; /* 左右对齐 */
  align-items: center;
  margin-top: calc(100vh * 32 / 812); /* 顶部间距 */
  padding-left: calc(100vw * 20 / 375);
  padding-right: calc(100vw * 20 / 375);
  width: 100%;
  box-sizing: border-box; /* 确保 padding 生效 */
  gap: calc(100vw * 20 / 375); /* 左右元素间距 */
}

.intro-text {
  flex: 1;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: normal;
  line-height: calc(100vw * 15.23 / 375);
  color: rgba(255, 255, 255, 1);
  word-break: break-word;
}

.chat-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: calc(100vw * 10 / 375); /* 两个元素间距10 */
  width: calc(100vw * 119 / 375);
  height: calc(100vh * 53 / 812);
  background: rgba(255, 255, 255, 0.1);
  border-radius: calc(100vw * 20 / 375);
  cursor: pointer;
}

.chat-btn-hidden {
  width: calc(100vw * 119 / 375);
  height: calc(100vh * 53 / 812);
}

.chat-icon {
  width: calc(100vw * 28 / 375);
  height: calc(100vw * 28 / 375);
  background-image: url('@/assets/chaticon.png');
  background-size: cover;
  background-position: center;
}

.chat-text {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  line-height: calc(100vw * 23.1 / 375);
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  -webkit-background-clip: text;
  background-clip: text; /* 添加标准属性 */
  -webkit-text-fill-color: transparent;
}

.post-title {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 24 / 375);
  font-weight: 400;
  line-height: calc(100vw * 27.72 / 375);
  color: rgba(255, 255, 255, 1);
  text-align: left; /* 确保左对齐 */
  margin-top: calc(100vh * 38 / 812);
  padding-left: calc(100vw * 20 / 375); /* 左间距，与页面内容对齐 */
  width: 100%;
  box-sizing: border-box;
}

/* PostList styles */
.post-list {
  display: flex;
  flex-direction: column;
  padding: calc(100vh * 16 / 812) calc(100vw * 20 / 375) calc(100vh * 34 / 812);
  width: 100%;
  box-sizing: border-box;
  gap: calc(100vh * 16 / 812); /* 项间距16 */
}

/* Post Item new layout */
.post-item {
  width: calc(100vw * 335 / 375);
  height: calc(100vw * 272 / 375);
  border-radius: calc(100vw * 20 / 375);
  background: rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  font-family: 'YesevaOne', sans-serif;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 0;
  box-sizing: border-box;
}

.post-item::after {
  content: '';
  position: absolute;
  inset: 0; /* top:0; right:0; bottom:0; left:0 */
  border-radius: inherit;
  padding: calc(100vw * 2 / 375); /* border thickness */
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Post item new sections */
.post-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: calc(100vw * 12 / 375);
  gap: calc(100vh * 10 / 812);
}

.post-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(100vw * 20 / 375);
}

.post-user {
  display: flex;
  align-items: center;
  gap: calc(100vw * 10 / 375);
}

.post-avatar {
  width: calc(100vw * 35 / 375);
  height: calc(100vw * 35 / 375);
  border-radius: 50%;
  padding: calc(100vw * 1 / 375); /* gradient border thickness */
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  box-sizing: border-box;
  display: flex;
}

.post-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.post-username {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 16.17 / 375);
  color: rgba(255, 255, 255, 1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-report {
  width: calc(100vw * 24 / 375);
  height: calc(100vw * 24 / 375);
  background-image: url('@/assets/postpiccommentreport.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
}

.post-image {
  width: 100%;
  height: calc(100vw * 171 / 375);
  border-radius: calc(100vw * 14 / 375);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.post-image-overlay {
  position: absolute;
  right: calc(100vw * 6 / 375);
  bottom: calc(100vh * 6 / 812);
  display: flex;
  gap: calc(100vw * 14 / 375);
}

.overlay-item {
  width: calc(100vw * 91 / 375);
  height: calc(100vw * 32 / 375);
  border-radius: calc(100vw * 40 / 375);
  background: rgba(255, 255, 255, 0.4);
  box-shadow: inset calc(100vw * -1 / 375) calc(100vw * -1 / 375) calc(100vw * 1 / 375) rgba(255, 255, 255, 0.6), inset calc(100vw * 1 / 375) calc(100vw * 1 / 375) calc(100vw * 1 / 375) rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(calc(100vw * 10 / 375));
  display: flex;
  justify-content: center;
  align-items: center;
  gap: calc(100vw * 10 / 375);
}

.overlay-icon {
  width: calc(100vw * 24 / 375);
  height: calc(100vw * 24 / 375);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.overlay-like {
  background-image: url('@/assets/likepic.png');
}

.overlay-comment {
  background-image: url('@/assets/chaticon.png');
}

.overlay-count {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 17.41 / 375);
  color: rgba(255, 255, 255, 1);
}

.post-type {
  font-family: 'Archivo', sans-serif;
  text-align: left;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  color: rgba(255, 255, 255, 1);
}

.top-btn {
  position: absolute;
  top: calc(100vh * 56 / 812);
  left: calc(100vw * 20 / 375);
  right: calc(100vw * 20 / 375);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}
</style>
