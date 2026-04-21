<template>
  <div class="page">
    <!-- <div class="aiusermodel"></div> -->
    <!-- <div class="aichatmodel"></div> -->
    <div class="page-container">
      <!-- top -->
      <div class="top-section">
        <BackButton />
      </div>
      <!-- center -->
      <div class="center-section">
        <div
          v-for="(item, index) in messages"
          :key="index"
          class="message-box"
          @click="handleMessageClick(item)"
        >
          <span>{{ item }}</span>
        </div>
      </div>
      <!-- bottom -->
      <div class="bottom-section">
        <div class="bottom-scroll">
          <div v-for="(item, index) in bottomItems" :key="index" class="chat-item">
            <div class="chat-choose" v-if="item.sendId === '0'">
                <div class="chat-time">{{ item.time }}</div>
                    <div class="chat-content">
                    <img class="chat-avatar" src="@/assets/aiavator.png" alt="AI Avatar" />
                    <div class="chat-message">{{ item.message }}</div>
                </div>
            </div>
            <div class="chat-choose" v-else>
                <div class="chat-time">{{ item.time }}</div>
                    <div class="chat-content-rigth">
                    <div class="chat-message-rigth">{{ item.message }}</div>
                    <div class="chat-avatar-rigth">
                      <img :src="currentUserStore.currentUser.avator" alt="AI Avatar" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部输入框 -->
    <!-- bottom input box -->
    <div class="bottom-input">
      <input type="text" placeholder="Say something" v-model="chatInput" />
      <img class="send-icon" src="@/assets/commentsend.png" alt="Send" @click="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BackButton from '@/components/back.vue'
import { useCurrentUserStore } from '@/stores/currentUser'
import { useUIStore } from '@/stores/ui'
import { aiChat } from '@/utils/ai'
import { decryptAES } from '@/utils/aes'

const messages = ref([
  "How to start working out?",
  "How often to exercise?",
  "How long per workout?"
])

const currentUserStore = useCurrentUserStore()
const uiStore = useUIStore()

const getFirstTime = () => {
  const key = 'chat_first_time'
  const saved = localStorage.getItem(key)

  if (saved) return saved

  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // 12:00
  localStorage.setItem(key, time)

  return time
}

const bottomItems = ref([
  { sendId: '0', time: getFirstTime(), message: 'Hi there! I’m Vaim, your AI buddy for all things fun and creative.' },
])

async function handleMessageClick(message) {
  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  bottomItems.value.push({
    sendId: currentUserStore.currentUser.id,
    time,
    message: message
  })

  if (uiStore.loading) return
  uiStore.showLoading()

  try {
    const res = await aiChat(message)

    uiStore.hideLoading()

    if (res.data.code === '0000') {
      // 1 解密
      const decryptText = decryptAES(res.data.result)
      // 2 转 JSON
      const data = JSON.parse(decryptText)
      const aiMessage = data?.output?.choices?.[0]?.message?.content || ''
      
      // 然后 push 到聊天列表
      bottomItems.value.push({
        sendId: '0',           // AI
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: aiMessage
      })
    } else {
      uiStore.showToast(res.data.message)
    }

  } catch (err) {
    uiStore.hideLoading()
    uiStore.showToast('Network error')
  }
}

const chatInput = ref('')

async function sendMessage() {
  const text = chatInput.value.trim()
  if (!text) return

  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  bottomItems.value.push({
    sendId: currentUserStore.currentUser.id,
    time,
    message: text
  })

  if (uiStore.loading) return
  uiStore.showLoading()
  try {
    const res = await aiChat(text)

    uiStore.hideLoading()

    if (res.data.code === '0000') {
      // 1 解密
      const decryptText = decryptAES(res.data.result)
      // 2 转 JSON
      const data = JSON.parse(decryptText)
      const aiMessage = data?.output?.choices?.[0]?.message?.content || ''
      
      // 然后 push 到聊天列表
      bottomItems.value.push({
        sendId: '0',           // AI
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: aiMessage
      })

      chatInput.value = ""
    } else {
      uiStore.showToast(res.data.message)
    }

  } catch (err) {
    uiStore.hideLoading()
    uiStore.showToast('Network error')
  }
}
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* prevent scrolling */
  background-color: #000; /* black background */
  background-image: url('@/assets/aibgc.png'); /* replace with your asset filename */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.aiusermodel {
  position: absolute;
  left: calc(100vw * 20 / 375);
  top: calc(100vh * 40 / 812); /* adapt top spacing */
  width: calc(100vw * 179 / 375);
  height: calc(100vh * 314 / 812);
  opacity: 1;
  background-image: url('@/assets/aiusermodel.png'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.aichatmodel {
  position: absolute;
  left: calc(100vw * 181 / 375);
  top: calc(100vh * 62 / 812);
  width: calc(100vw * 104 / 375);
  height: calc(100vh * 38 / 812);
  opacity: 1;
  background-image: url('@/assets/aichatmodel.png'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.top-section {
  position: relative;
  margin-top: calc(100vh * 56 / 812);
  margin-left: calc(100vw * 20 / 375);
  z-index: 100;
}

.center-section {
  margin-top: calc(100vh * 50 / 812); /* 顺便往上调 */
  margin-left: calc(100vw * 20 / 375); /* 左边贴一点 */
  margin-right: calc(100vw * 100 / 375); /* 控制最大宽度 */
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 12 / 812);
}

.message-box {
  display: inline-flex;
  align-items: center;
  height: calc(100vh * 36 / 812);
  padding: 0 calc(100vw * 10 / 375);
  border-radius: calc(100vw * 40 / 375);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(calc(100vw * 4 / 375));
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  color: rgba(255, 255, 255, 1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: fit-content; /* Wrap width to content */
  justify-content: flex-start; /* Align content to left */
}

.bottom-section {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: calc(100vh * 325 / 812); /* adjust top spacing as needed */
  background: rgba(255, 255, 255, 1);
  border-radius: calc(100vw * 40 / 375) calc(100vw * 40 / 375) 0 0;
  z-index: 2;
}

.bottom-scroll {
  height: calc(100% - calc(100vh * 20 / 812));
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-top: calc(100vh * 20 / 812);
  padding-bottom: calc(100vh * 90 / 812);
  box-sizing: border-box;
  gap: calc(100vh * 24 / 812);
}

/* Optional: hide scrollbar */
.bottom-scroll::-webkit-scrollbar {
  display: none;
}
.bottom-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.chat-item {
  display: flex;
  flex-direction: column;
}

.chat-choose {
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 16 / 812);
}

.chat-time {
  text-align: center;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 17.41 / 375);
  letter-spacing: 0;
  color: rgba(105, 71, 65, 1);
}

.chat-content {
  display: flex;
  align-items: flex-start;
  gap: calc(100vw * 12 / 375);
  margin-left: calc(100vw * 20 / 375);
  margin-right: calc(100vw * 34 / 375);
}

.chat-content-rigth {
  display: flex;
  align-items: flex-start;
  justify-content: end;
  gap: calc(100vw * 12 / 375);
  margin-left: calc(100vw * 34 / 375);
  margin-right: calc(100vw * 20 / 375);
}

.chat-avatar {
  width: calc(100vw * 44 / 375);
  height: calc(100vw * 44 / 375);
  border-radius: 50%;
}

.chat-avatar-rigth {
  width: calc(100vw * 44 / 375);
  height: calc(100vw * 44 / 375);
  flex-shrink: 0;
  border-radius: 50%; /* fully circular */
  padding: calc(100vw * 1 / 375); /* border thickness */
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

/* Ensure avatar images fit inside the circular container and any overflow is hidden */
.chat-avatar img,
.chat-avatar-rigth img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* ensure image fills container */
  border-radius: 50%;
  overflow: hidden;
}

.chat-message {
  border-radius: 0 calc(100vw * 10 / 375) calc(100vw * 10 / 375) calc(100vw * 10 / 375);
  background: rgba(255, 159, 142, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: calc(100vh * 10 / 812) calc(100vw * 10 / 375);
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  color: rgba(255, 255, 255, 1);
}

.chat-message-rigth {
  border-radius: calc(100vw * 10 / 375) 0 calc(100vw * 10 / 375) calc(100vw * 10 / 375);
  background: rgba(201, 255, 221, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: calc(100vh * 10 / 812) calc(100vw * 10 / 375);
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  color: rgba(105, 71, 65, 1);
}

.bottom-input {
  position: absolute;
  left: calc(100vw * 20 / 375);
  right: calc(100vw * 20 / 375);
  bottom: calc(100vh * 29 / 812);
  height: calc(100vh * 54 / 812);
  display: flex;
  align-items: center;
  gap: calc(100vw * 10 / 375);
  background: rgba(201, 255, 221, 1);
  border-radius: calc(100vw * 40 / 375);
  backdrop-filter: blur(calc(100vw * 32 / 375));
  box-sizing: border-box;
  padding: 0 calc(100vw * 16 / 375);
  z-index: 200;
}

.bottom-input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  font-family: 'Archivo', sans-serif;
  color: rgba(0,0,0,1);
}

.bottom-input input::placeholder {
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  font-family: 'Archivo', sans-serif;
  color: rgba(105, 71, 65, 1);
}

.send-icon {
  width: calc(100vw * 30 / 375);
  height: calc(100vw * 30 / 375);
  cursor: pointer;
}
</style>