<template>
  <div class="page">
    <div v-if="post" class="page-content">
      <!-- 顶部轮播图 -->
      <div class="swipe-wrapper">
        <van-swipe lazy-render :loop="false" class="swipe-container">
          <van-swipe-item v-for="image in images" :key="image" class="swipe-item">
            <img :src="image" class="swipe-img" />
          </van-swipe-item>
          <template #indicator="{ active, total }">
            <div class="indicator-wrapper">
              <span
                v-for="(item, index) in total"
                :key="index"
                :class="['indicator', { active: index === active }]"
              ></span>
            </div>
          </template>
        </van-swipe>
        <!-- 顶部按钮 -->
        <div class="top-btn">
          <BackButton/>
          <MoreButton v-if="post.userId !== currentUserStore.currentUser.userId" @click="showPostReport = true" />
        </div>
      </div>
      <!-- 帖子内容 -->
      <div class="post-content">
        <div class="post-row">
          <!-- 左边内容 -->
          <div class="post-content-row">
            <!-- 用户内容 -->
            <div class="user-box">
            <div class="avatar" @click="goOtherHome(postUser.userId)">
              <div class="avatar-img" :style="{ backgroundImage: postUser && `url(${postUser.avator})` }"></div>
            </div>
            <div class="user-name" @click="goOtherHome(postUser.userId)">
              {{ postUser && postUser.name }}
            </div>
          </div>
          <!-- 帖子内容 -->
          <div class="second-box">
            <div class="post-desc">
              {{ post.dynamicDesc }}
            </div>
            <div class="tag-box">
              <div class="tag-text"># {{ postTag }}</div>
            </div>
          </div>
          </div>
          <!-- 点赞内容 -->
          <div class="like-box" @click="toggleLike">
            <img :src="currentUserStore.currentUser.postLikeIds.includes(postId.toString()) ? likeImage : disLikeImage" alt="like" class="like-icon" />
            <div class="like-count">{{ post.dynamicLikeCount + (currentUserStore.currentUser.postLikeIds.includes(postId.toString()) ? 1 : 0) }}</div>
          </div>
        </div>
      </div>
      <!-- Comments -->
      <div class="comments-title">
        <div class="comments-box1"></div>
        <div class="comments-title-text">Comments</div>
        <div class="comments-box2"></div>
      </div>
      <!-- 评论列表 -->
      <div class="comments-list">
        <template v-if="comments.length">
          <div class="comment-item" v-for="(comment, index) in comments" :key="index">
            <div class="comment-list-top">
              <div class="comment-list-user" @click="goOtherHome(comment.userId)">
                <div class="comment-avatar">
                  <div class="comment-avatar-img" :style="{ backgroundImage: `url(${userStore.getUserById(comment.userId).avator})` }"></div>
                </div>
                <div class="comment-user-name">{{ userStore.getUserById(comment.userId).name }}</div>
              </div>
              <div class="comments-list-more" :style="{ backgroundImage: `url(${commentMoreImage})` }" v-if="comment.userId !== currentUserStore.currentUser.userId" @click="handleCommentReport(comment.userId)"></div>
            </div>
            <div class="comment-list-bottom">{{ comment.content }}</div>
          </div>
        </template>
        <template v-else>
          <Empty />
        </template>
      </div>
      <!-- 输入框 -->
      <div class="input-box">
        <input type="text" placeholder="Say something" class="input-field" v-model="commentInput" />
        <div class="send-btn" :style="{ backgroundImage: `url(${commentSendImage})` }" @click="sendComment"></div>
      </div>
    </div>
    <div v-else class="not-found">
      <p>The post was not found.</p>
    </div>
    <ReportDialog v-if="showPostReport" @close="showPostReport = false" @select="postReportSelect" >
    </ReportDialog>
    <ReportDialog v-if="showCommentReport" @close="showCommentReport = false" @select="commentReportSelect" >
    </ReportDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useUserStore } from '@/stores/user'
import { useOtherStore } from '@/stores/other'
import { useCurrentUserStore } from '@/stores/currentUser'
import { useUIStore } from '@/stores/ui'
import { useCommentsStore } from '@/stores/comment'
import BackButton from '@/components/back.vue'
import MoreButton from '@/components/more.vue'
import likeImage from '@/assets/likepic.png'
import disLikeImage from '@/assets/dislikepic.png'
import commentMoreImage from '@/assets/postpiccommentreport.png'
import commentSendImage from '@/assets/commentsend.png'
import ReportDialog from '@/components/reportChoose.vue'
import Empty from '@/components/empty.vue'
import { goBackOrClose } from '@/utils/iosBridge'
import { requireLoginForAction } from '@/utils/guestAuth'

const { postId } = defineProps({
  postId: {
    type: [String, Number],
    required: true
  }
})

const postStore = usePostStore()
const post = postStore.getPostById(postId)
const images = computed(() => {
  return post.dynamicPic
})

const userStore =  useUserStore()
const postUser = userStore.getUserById(post.userId)

const otherStore =  useOtherStore()
const postTag = otherStore.getTagByIndex(post.dynamicTitleType)

const commentsStore = useCommentsStore()
const comments = ref(commentsStore.getCommentsById(postId))

// 评论输入框内容
const commentInput = ref('')

const currentUserStore = useCurrentUserStore()

const uiStore = useUIStore()

const router = useRouter()

//帖子举报、拉黑
const showPostReport = ref(false)
function postReportSelect(value) {
  showPostReport.value = false
  if (value === 0) {
    if (requireLoginForAction(currentUserStore, uiStore, {
      message: 'Guests need to log in before reporting.'
    })) return

    router.push({ name: 'report' })
  } else if (value === 1) {
    //用户选择屏蔽
    if (uiStore.loading) return
    uiStore.showLoading()

    const postUserId = post.userId

    // 用户选择屏蔽时加入 blockList
    if (postUserId) {
      const blockList = currentUserStore.currentUser.blockList || []

      // 不存在才加入，避免重复
      if (!blockList.includes(postUserId)) {
        blockList.unshift(postUserId)

        // 使用 userStore 公共方法同步更新当前用户并回传 iOS
        userStore.updateUser(currentUserStore.currentUser.userId, { blockList: blockList })
      }
    }

    const delay = Math.floor(Math.random() * 1500) + 500

    setTimeout(() => {
      uiStore.hideLoading()
      uiStore.showToast('Blocking successful')

      goBackOrClose()

    }, delay)
  }
}

// 点击用户头像跳转到用户主页
function goOtherHome(userId) {
  if (!userId) return
  router.push({ name: 'otherHome', params: { userId } })
}

// 点赞逻辑
function toggleLike() {
  if (requireLoginForAction(currentUserStore, uiStore, {
    message: 'Guests need to log in before liking posts.'
  })) return

  const postLikeIds = currentUserStore.currentUser.postLikeIds
  // 判断当前用户是否已经点赞
  const likedIndex = postLikeIds.indexOf(postId)

  if (likedIndex === -1) {
    // 未点赞，添加postId到postLikeIds
    postLikeIds.push(postId)
  } else {
    // 已点赞，移除postId
    postLikeIds.splice(likedIndex, 1)
    // 点赞数不减少，保持原有逻辑
  }

  // 同步更新userStore，并回传iOS
  userStore.updateUser(currentUserStore.currentUser.userId, { postLikeIds: postLikeIds })
}

//评论击败、拉黑
const reportCommentUserId = ref(null)
const showCommentReport = ref(false)

function handleCommentReport(userId) {
  reportCommentUserId.value = userId
  showCommentReport.value = true
}

function commentReportSelect(value) {
  showCommentReport.value = false

  const userIdToBlock = reportCommentUserId.value
  if (!userIdToBlock) return

  if (value === 0) {
    if (requireLoginForAction(currentUserStore, uiStore, {
      message: 'Guests need to log in before reporting.'
    })) return

    router.push({ name: 'report' })
  } else if (value === 1) {
    // 拉黑逻辑
    if (uiStore.loading) return
    uiStore.showLoading()

    const blockList = currentUserStore.currentUser.blockList || []
    if (!blockList.includes(userIdToBlock)) {
      blockList.unshift(userIdToBlock)
      userStore.updateUser(currentUserStore.currentUser.userId, { blockList })
    }

    const delay = Math.floor(Math.random() * 1500) + 500

    setTimeout(() => {
      uiStore.hideLoading()
      uiStore.showToast('Blocking successful')
      // 重新获取评论列表，过滤掉被拉黑的用户
      comments.value = commentsStore.getCommentsById(postId)

    }, delay)
  }
}

// 发送评论逻辑
function sendComment() {
  if (requireLoginForAction(currentUserStore, uiStore, {
    message: 'Guests need to log in before commenting.'
  })) return

  const content = commentInput.value.trim()
  if (!content) return // 输入为空直接返回

  // 创建评论对象
  const newComment = {
    commentId: String(commentsStore.comment.length + 1),
    dynamicId: String(postId),
    userId: currentUserStore.currentUser.userId,
    content: content
  }

  // 添加到评论 store
  commentsStore.addComment(newComment)

  // 更新帖子评论数量
  postStore.updatePostById(postId, { dynamicCommentCount: (post.dynamicCommentCount || 0) + 1 })

  // 清空输入框
  commentInput.value = ''

  // 重新获取评论列表，过滤掉被拉黑的用户
  comments.value = commentsStore.getCommentsById(postId)
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

.page-content {
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 1rem; /* 留点左右空隙 */
  text-align: center; /* 居中文本 */
}

.not-found p {
  color: #fff;
  font-size: 0.48rem; /* 移动端适配 */
  line-height: 1.5rem;
  word-break: break-word; /* 长文本自动换行 */
}

.swipe-wrapper {
  position: relative;
  height: calc(100vh * 379 / 812);
  border-radius: 0 0 calc(100vw * 20 / 375) calc(100vw * 20 / 375); /* 底部两个角圆角 */
  overflow: hidden;
}

.swipe-container {
  width: 100%;
  height: 100%; /* 高度填满外层 */
}

.swipe-item {
  width: 100%;
  height: auto; /* 你的 van-swipe 高度 */
  overflow: hidden; /* 超出裁剪 */
}

.swipe-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片铺满容器，超出裁剪 */
  display: block;
}

.indicator-wrapper {
  position: absolute;
  bottom: calc(100vh * 17 / 812);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: calc(100vw * 4 / 375); /* 圆点间距 */
}

/* 单个指示器 */
.indicator {
  width: calc(100vw * 12 / 375);
  height: calc(100vh * 6 / 812);
  border-radius: calc(100vw * 45 / 375);
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
}

/* 选中状态 */
.indicator.active {
  width: calc(100vw * 32 / 375);
  height: calc(100vh * 6 / 812);
  border-radius: 45px;
  background: rgba(255, 255, 255, 1);
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

.post-content {
  padding: calc(100vh * 24 / 812) calc(100vw * 20 / 375) 0;
}

.user-box {
  width: calc(100vw * 50 / 375);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(100vh * 2 / 812);
  margin-right: calc(100vw * 15 / 375); /* 左间距15 */
}

.post-row {
  display: flex;
  align-items: flex-start; /* 改成顶部对齐 */
  justify-content: space-between;
}

.post-content-row {
  display: flex;
}

.second-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 左对齐 */
  gap: calc(100vh * 7 / 812); /* 上下间距7 */
}

.post-desc {
  margin-right: auto; /* 第二个靠左 */
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  color: #fff;
  line-height: calc(100vw * 18 / 375);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* 超过三行省略 */
  overflow: hidden;
  text-align: left;
}

.tag-box {
  display: inline-flex; /* 内容撑开宽度 */
  height: calc(100vh * 26 / 812);
  border-radius: calc(100vw * 40 / 375);
  background: linear-gradient(
    135deg,
    rgba(255, 159, 142, 1) 0%,
    rgba(241, 213, 160, 1) 32.13%,
    rgba(201, 255, 221, 1) 67.84%,
    rgba(157, 255, 255, 1) 100%
  );
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.tag-text {
  font-size: calc(100vw * 12 / 375);
  color: rgba(74, 32, 25, 1);
  padding: 0 calc(100vw * 10 / 375);
  text-align: center;
}

.post-time {
  font-size: calc(100vw * 12 / 375);
  color: rgba(255,255,255,0.6);
}

.avatar {
  width: calc(100vw * 36 / 375);
  height: calc(100vw * 36 / 375);
  border-radius: 50%;
  padding: calc(100vw * 1 / 375); /* 渐变边框宽度 */
  background: linear-gradient(
    135deg,
    rgba(255, 159, 142, 1) 0%,
    rgba(241, 213, 160, 1) 32.13%,
    rgba(201, 255, 221, 1) 67.84%,
    rgba(157, 255, 255, 1) 100%
  );
  box-sizing: border-box;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.user-name {
  width: calc(100vw * 46 / 375);
  height: calc(100vw * 19 / 375);
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 18.48 / 375);
  color: rgba(255, 255, 255, 1);

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.like-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(100vh * 4 / 812); /* 上下间距4 */
  margin-left: calc(100vw * 15 / 375); /* 左间距15 */
}

.like-icon {
  width: calc(100vw * 24 / 375);
  height: calc(100vw * 24 / 375);
}

.like-count {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  color: #fff;
  text-align: center;
}

.comments-title {
  display: flex;
  align-items: center;
  gap: calc(100vw * 6 / 375); /* 每条评论间距 */
  padding: calc(100vh * 24 / 812) calc(100vw * 20 / 375) 0;
}

.comments-box1 {
  width: calc(100vw * 31 / 375);
  height: calc(100vh * 1 / 812);
  background-color: #fff;
}

.comments-title-text {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 18.48 / 375);
  color: rgba(255, 255, 255, 1);
}

.comments-box2 {
  flex: 1; /* 自动填充剩余宽度 */
  height: calc(100vh * 1 / 812);
  background-color: #fff;
}

.comments-list {
  padding: calc(100vh * 20 / 812) calc(100vw * 20 / 375) calc(100vh * 100 / 812);
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 10 / 812); /* 评论上下间隔10 */
}

.comment-item {
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 4 / 812); /* 评论上下间隔10 */
  padding: calc(100vh * 14 / 812) calc(100vw * 16 / 375);
  border-radius: calc(100vw * 20 / 375);
  background: rgba(255, 255, 255, 0.16);
}

.comment-list-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-list-user {
  display: flex;
  gap: calc(100vw * 12 / 375);
}

.comment-list-bottom {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 12 / 375);
  width: 400;
  color: rgba(255, 255, 255, 1);
  text-align: left;
}

.comment-avatar {
  width: calc(100vw * 32 / 375);
  height: calc(100vw * 32 / 375);
  border-radius: 50%;
  padding: calc(100vw * 1 / 375); /* border width */
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  box-sizing: border-box;
  display: flex;
}

.comment-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.comment-user-name {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 18.48 / 375);
  color: rgba(255, 255, 255, 1);
  text-align: left;
  display: flex;
  align-items: center;
}

.comments-list-more {
  width: calc(100vw * 24 / 375);
  height: calc(100vw * 24 / 375);

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 输入框样式 */
.input-box {
  position: fixed;
  left: calc(100vw * 20 / 375);
  right: calc(100vw * 20 / 375);
  bottom: calc(100vh * 29 / 812);
  width: auto;
  height: calc(100vh * 54 / 812);
  background: rgba(201, 255, 221, 1);
  border-radius: calc(100vw * 40 / 375);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 calc(100vw * 16 / 375);
  z-index: 20;
}

.input-field {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400; /* 可选字体粗细 */
  color: #000; /* 输入文本颜色 */
  padding: 0;
}

.input-field::placeholder {
  color: rgba(105, 71, 65, 1); /* 提示文本颜色 */
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375); /* 提示文本大小 */
  font-weight: 400; /* 可选字体粗细 */
}

.send-btn {
  width: calc(100vw * 30 / 375);
  height: calc(100vw * 30 / 375);

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
