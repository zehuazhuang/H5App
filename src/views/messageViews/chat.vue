<template>
  <div class="page">
    <!-- 顶部背景层 -->
    <div class="top-background"></div>
    <!-- 内容部分 -->
    <div class="content">
      <!-- 顶部内容 -->
      <div class="top-content">
        <div class="left-part">
          <BackButton />
          <div class="user-info" @click="goOtherHome(otherUser.userId)">
            <img class="avatar" :src="otherUser.avator" alt="avatar" />
            <span class="username">{{ otherUser.name }}</span>
          </div>
        </div>

        <div class="right-part">
          <div class="icon-group">
            <img src="@/assets/chatpicicon.png" class="icon" @click="selectImage" />
            <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="handleImageChange" />
            <img src="@/assets/chatvideoicon.png" class="icon" @click="openVideoCall" />
          </div>
          <MoreButton @click="openReportDialog" />
        </div>
      </div>

      <!-- 聊天内容 -->
      <div class="chat-content">
        <div v-for="msg in messages" :key="msg.msgId" :class="['chat-item', { 'own-message': msg.userId === currentUserId }]">
          <img class="chat-avatar" @click="goOtherHome(msg.userId)" :src="getUserAvatar(msg.userId)" alt="avatar" />
          <div class="chat-right">
            <div v-if="msg.userId === currentUserId && msg.sendPicUrl" class="chat-message-image">
              <div class="image-container">
                <img :src="msg.sendPicUrl" alt="send image" />
              </div>
            </div>
            <div v-else class="chat-message" v-text="msg.sendContent"></div>
            <div class="chat-time">{{ formatTime(msg.sendTime) }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部输入框 -->
    <div class="bottom-input">
      <input type="text" placeholder="Say something" v-model="inputText" />
      <img class="send-btn" src="@/assets/commentsend.png" alt="send" @click="sendMessage" />
    </div>
    <!-- Video Call Sheet -->
    <transition name="slide-up">
      <div v-if="showVideoCall" class="video-call-sheet">
        <VideoCall :userId="otherUser.userId" @hangup="closeVideoCall" />
      </div>
    </transition>

    <ReportDialog v-if="showReport" @close="showReport = false" @select="reportSelect" >
    </ReportDialog>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChatsStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useMessagesStore } from '@/stores/message'
import { useCurrentUserStore } from '@/stores/currentUser'
import { useUIStore } from '@/stores/ui'
import BackButton from '@/components/back.vue'
import MoreButton from '@/components/more.vue'
import VideoCall from '@/views/messageViews/videocall.vue'
import ReportDialog from '@/components/reportChoose.vue'
import { requireLoginForAction } from '@/utils/guestAuth'
import { goBackOrClose } from '@/utils/iosBridge'
import { uploadSingleImage } from '@/utils/ossUpload'

const props = defineProps({
  chatId: String
})

const chatsStore = useChatsStore()
const userStore = useUserStore()
const currentUserStore = useCurrentUserStore()
const messagesStore = useMessagesStore()
const uiStore = useUIStore()
const router = useRouter()
const currentUserId = currentUserStore.currentUser.userId

// 当前聊天室信息
const currentChat = chatsStore.getChatById(props.chatId)

// 点击用户头像跳转到用户主页
function goOtherHome(userId) {
  if (!userId) return
  router.push({ name: 'otherHome', params: { userId } })
}

// 获取聊天室中除自己以外的另一个用户信息
const otherUser = userStore.getOtherUserInChat(currentChat.chatUserIds)

const messages = ref(messagesStore.getMessagesByChatId(props.chatId))
function getUserAvatar(userId) {
  const user = userStore.getUserById(userId)
  return user?.avator || ''
}

function formatTime(timeStr) {
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const inputText = ref('')

const imageInput = ref(null)

function selectImage() {
  imageInput.value && imageInput.value.click()
}

async function handleImageChange(e) {

  const file = e.target.files[0]
  if (!file) {
    return
  }

  if (uiStore.loading) return
  uiStore.showLoading()
  try {
    const url = await uploadSingleImage(file, 'template_development')

    console.log('uploaded image url:', url)

    // 这里可以创建一条图片消息
    messagesStore.addMessage?.({
        msgId: String(messagesStore.message.length + 1),
        chatId: props.chatId,
        userId: currentUserStore.currentUser.userId,
        sendContent: "",
        sendPicUrl: url,
        sendTime: new Date().toISOString()
    })

    chatsStore.updateChat?.(props.chatId, {
      lastSendContent : '[image message]',
      lastSendTime : new Date().toISOString(),
      unreadMsgCount : currentChat.unreadMsgCount + 1,
      lastSendUserId : currentUserStore.currentUser.userId
    })

    messages.value = messagesStore.getMessagesByChatId(props.chatId)

  } catch (err) {
    console.error('upload image failed', err)
    uiStore.showToast('Upload failed, please check your network.')
  } finally {
    uiStore.hideLoading()
  }

  e.target.value = ''
}

function sendMessage() {
  if(inputText.value.trim() !== '') {
    // 这里可以创建一条图片消息
    messagesStore.addMessage?.({
        msgId: String(messagesStore.message.length + 1),
        chatId: props.chatId,
        userId: currentUserStore.currentUser.userId,
        sendContent: inputText.value,
        sendPicUrl: '',
        sendTime: new Date().toISOString()
    })

    chatsStore.updateChat?.(props.chatId, {
      lastSendContent : inputText.value,
      lastSendTime : new Date().toISOString(),
      unreadMsgCount : currentChat.unreadMsgCount + 1,
      lastSendUserId : currentUserStore.currentUser.userId
    })

    messages.value = messagesStore.getMessagesByChatId(props.chatId)

    inputText.value = ''
  }
}

const showVideoCall = ref(false)

function openVideoCall() {
  showVideoCall.value = true
}

function closeVideoCall() {
  showVideoCall.value = false
}

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
    if (!blockList.includes(otherUser.userId)) {
      blockList.unshift(otherUser.userId)

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
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 1);
  overflow: hidden;
}

.top-background {
  height: calc(100vh * 162 / 812);
  opacity: 1;
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  width: 100%;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 16 / 812);
}

.top-content {
  padding:calc(100vh * 56 / 812) calc(100vw * 20 / 375) 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-part {
  display: flex;
  align-items: center;
  gap: calc(100vw * 15 / 375);
}

.user-info {
  display: flex;
  align-items: center;
  gap: calc(100vw * 12 / 375);
}

.avatar {
  width: calc(100vw * 40 / 375);
  height: calc(100vw * 40 / 375);
  border-radius: 50%;
  border: calc(100vw * 1 / 375) solid #fff;
  object-fit: cover;
}

.username {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 18.48 / 375);
  letter-spacing: 0;
  color: rgba(74, 32, 25, 1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.right-part {
  display: flex;
  align-items: center;
  gap: calc(100vw * 17 / 375);
}

.icon-group {
  display: flex;
  gap: calc(100vw * 24 / 375);
}

.icon {
  width: calc(100vw * 24 / 375);
  height: calc(100vw * 24 / 375);
  cursor: pointer;
}

.chat-content {
  flex: 1;
  border-radius: calc(100vw * 20 / 375) calc(100vw * 20 / 375) 0 0;
  background: rgba(235, 236, 237, 1);
  backdrop-filter: blur(calc(100vw * 12 / 375));
  overflow-y: auto;
  padding-top: calc(100vh * 24 / 812);
  padding-bottom: calc(100vh * 90 / 812);
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 16 / 812);
}

.chat-item {
  display: flex;
  align-items: flex-start;
  gap: calc(100vw * 10 / 375);
  margin: 0 calc(100vw * 118 / 375) 0 calc(100vw * 20 / 375); /* 默认靠左消息 */
}

.chat-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(100vh * 8 / 812);
}

.chat-avatar {
  width: calc(100vw * 44 / 375);
  height: calc(100vw * 44 / 375);
  border-radius: 50%;
  padding: calc(100vw * 1 / 375); /* border thickness */
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-shrink: 0; /* prevent avatar from being compressed */
  object-fit: cover;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.chat-message {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 17.41 / 375);
  color: rgba(105, 71, 65, 1);
  padding: calc(100vh * 10 / 812) calc(100vw * 10 / 375);
  border-radius: 0px calc(100vw * 10 / 375) calc(100vw * 10 / 375) calc(100vw * 10 / 375);
  background: rgba(201, 255, 221, 1);
}

.chat-time {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 12 / 375);
  font-weight: 400;
  line-height: calc(100vw * 13.06 / 375);
  color: rgba(153, 153, 153, 1);
  text-align: right;
}

.chat-item.own-message {
  flex-direction: row-reverse;
  margin: 0 calc(100vw * 20 / 375) 0 calc(100vw * 118 / 375); /* 自己消息靠右反转间距 */
}

.chat-item.own-message .chat-right {
  align-items: flex-start;
}

.chat-item.own-message .chat-message {
  border-radius: calc(100vw * 10 / 375) 0px calc(100vw * 10 / 375) calc(100vw * 10 / 375);
  background: rgba(255, 159, 142, 1);
}

/* image message styles */
.chat-message-image .image-container {
  border-radius: calc(100vw * 20 / 375);
  background: rgba(255, 255, 255, 1);
  padding: calc(100vw * 5 / 375);
}

.chat-message-image .image-container img {
  width: 100%;
  height: auto;
  border-radius: calc(100vw * 16 / 375);
  object-fit: contain;
}

.bottom-input {
  position: absolute;
  left: calc(100vw * 20 / 375);
  right: calc(100vw * 20 / 375);
  bottom: calc(100vh * 29 / 812);
  height: calc(100vh * 54 / 812);
  border-radius: calc(100vw * 40 / 375);
  background: rgba(201, 255, 221, 1);
  box-shadow: 0px calc(100vw * 2 / 375) calc(100vw * 4 / 375) rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(calc(100vw * 32 / 375));
  display: flex;
  align-items: center;
  padding: 0 calc(100vw * 16 / 375);
  gap: calc(100vw * 16 / 375);
  box-sizing: border-box;
}

.bottom-input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  color: #000;
}

.bottom-input input::placeholder {
  color: rgba(105, 71, 65, 0.5);
}

.send-btn {
  width: calc(100vw * 30 / 375);
  height: calc(100vw * 30 / 375);
  cursor: pointer;
}

.video-call-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
}
</style>
