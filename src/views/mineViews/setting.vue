<template>
  <div class="page">
    <div class="header">
      <BackButton />
      <h1 class="title">Setting</h1>
    </div>
    <main class="options-list">
      <div class="option" v-for="(option, index) in options" :key="index" @click="handleOption(index)">
        <span class="option-text">{{ option.text }}</span>
        <div class="option-right">
          <div class="arrow-placeholder"></div>
        </div>
      </div>
    </main>
    <div class="footer">
      <button class="btn delete-btn" @click="handleAction(true)">Delete account</button>
      <button class="btn logout-btn" @click="handleAction(false)">Log out</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useUserStore } from '@/stores/user'
import { useCurrentUserStore } from '@/stores/currentUser'
import BackButton from '@/components/back.vue'
import { sendLogoutToIOS } from '@/utils/iosBridge'

const options = ref([
  { text: 'Privacy Policy' },
  { text: 'User Agreement' },
  { text: 'Blacklist' },
  { text: 'Wallet' },
  { text: 'Edit personal information' }
])

const router = useRouter()
const uiStore = useUIStore()
const userStore =  useUserStore()
const currentUserStore = useCurrentUserStore()

function handleOption(index) {
  switch (index) {
    case 0:
      router.push({ name: 'privacyPolicy' })
      break
    case 1:
      router.push({ name: 'userAgreement' })
      break
    case 2:
      router.push({ name: 'block' })
      break
    case 3:
      router.push({ name: 'coins' })
      break
    case 4:
      router.push({ name: 'edit' })
      break
    default:
      break
  }
}

function handleAction(isDelete) {
  if (uiStore.loading) return
  uiStore.showLoading()

  if (isDelete) {
    userStore.updateUser(currentUserStore.currentUser.userId, { isdelete: 1 })
  }

  const delay = Math.floor(Math.random() * 1500) + 500

  setTimeout(() => {
    uiStore.hideLoading()
    sendLogoutToIOS(isDelete)

  }, delay)
}
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 1);
  background-image: url('@/assets/pagebgc.png');
  background-size: cover; /* 等比缩放覆盖 */
  background-position: center; /* 居中显示 */
  background-repeat: no-repeat;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: calc(100vw * 16 / 375);
  padding: calc(100vh * 58 / 812) calc(100vw * 20 / 375) 0;
}

.title {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  color: #000; 
}

/* Options List */
.options-list {
  flex: 1;
  padding: calc(100vh * 20 / 812) calc(100vw * 20 / 375) 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 16 / 812);
}

.option {
  position: relative;
  height: calc(100vh * 52 / 812);
  border-radius: calc(100vw * 20 / 375);
  background: #fff; /* 白底 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 calc(100vw * 10 / 375);
  z-index: 1;
}

.option::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: calc(100vw * 20 / 375);
  padding: 1.5px; /* 边框粗细 */

  background: linear-gradient(
    162deg,
    rgba(151, 229, 246, 1),
    rgba(190, 92, 255, 1),
    rgba(195, 99, 255, 1),
  );

  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;

  z-index: -1;
}

.option-text {
  font-family: 'Archivo', sans-serif;
  color: #000;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
}

.option-right .arrow-placeholder {
  width: calc(100vw * 24 / 375);
  height: calc(100vw * 24 / 375);
  background-image: url('@/assets/seetinggoicon.png');
  background-size: cover; /* 等比缩放覆盖 */
  background-position: center; /* 居中显示 */
  background-repeat: no-repeat;
  overflow: hidden;
}

/* Footer */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(100vh * 20 / 812);
  padding-bottom: calc(100vh * 83 / 812);
}

.btn {
  width: calc(100vw * 229 / 375);
  height: calc(100vh * 62 / 812);
  border-radius: calc(100vw * 40 / 375);
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  box-shadow:inset calc(100vw * -2 / 375) calc(100vw * -2 / 375) calc(100vw * 2 / 375)  rgba(255, 255, 255, 0.6),inset calc(100vw * 2 / 375) calc(100vw * 2 / 375) calc(100vw * 2 / 375)  rgba(255, 255, 255, 0.5);
}

.delete-btn {
  background: #ff3b30; 
  color: #fff;
}

.logout-btn {
  background: #ff3b30; 
  color: #fff;
}
</style>