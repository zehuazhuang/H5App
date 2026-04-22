<template>
  <div class="page">
    <div class="top-header">
      <BackButton />
      <span class="edit-title">Edit</span>
    </div>
    <div class="content">
      <div class="top">
        <div class="top-block" :style="{ backgroundImage: `url(${topBlockImage})` }" @click="chooseAvatar">
            <div class="camera-corner">
            <img src="@/assets/cameraicon.png" alt="camera" />
            </div>
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display:none"
        @change="onFileChange"
      />
      <div class="second">
        <div class="second-section">
            <div class="label">Name</div>
            <div class="input-box">
            <input v-model="name" type="text" placeholder="Please enter" />
            </div>
        </div>
      </div>
      <div class="third">
        <div class="third-section">
            <div class="label">About me</div>
            <div class="input-box about-me-box">
            <textarea v-model="aboutMe" placeholder="Please enter"></textarea>
            </div>
        </div>
      </div>
      <div class="fourth-section">
        <div class="save-btn" @click="saveProfile">Save</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCurrentUserStore } from '@/stores/currentUser'
import { useUIStore } from '@/stores/ui'
import { useUserStore } from '@/stores/user'
import BackButton from '@/components/back.vue'
import { goBackOrClose } from '@/utils/iosBridge'
import { uploadSingleImage } from '@/utils/ossUpload'

// Use relative path for web build
const topBlockImage = ref('/src/assets/avataricon.png')

const name = ref('')
const aboutMe = ref('')

const fileInput = ref(null)
const avatarFile = ref(null)

const currentUserStore = useCurrentUserStore()
const uiStore = useUIStore()
const userStore =  useUserStore()

const chooseAvatar = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  avatarFile.value = file

  // 本地预览
  const reader = new FileReader()
  reader.onload = (ev) => {
    topBlockImage.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

const saveProfile = async () => {
  if (!name.value.trim()) {
    uiStore.showToast('Please enter name')
    return
  }

  if (!aboutMe.value.trim()) {
    uiStore.showToast('Please enter about me')
    return
  }

  if (uiStore.loading) return
  uiStore.showLoading()

  let avatarUrl = topBlockImage.value

  try {
    if (avatarFile.value) {
      avatarUrl = await uploadSingleImage(avatarFile.value, 'template_development')
    }

    const delay = avatarFile.value ? 0 : Math.floor(Math.random() * 1500) + 500

    setTimeout(() => {
      userStore.updateUser(currentUserStore.currentUser.userId, { 
        avator: avatarUrl,
        name: name.value,
        about: aboutMe.value
      })

      uiStore.hideLoading()

      goBackOrClose()

      uiStore.showToast('Profile updated')
    }, delay)

  } catch (e) {
    console.error(e)
    uiStore.hideLoading()
    uiStore.showToast('Updated failed, please check your network.')
  }
}

onMounted(() => {
  const user = currentUserStore.currentUser
  if (!user) return

  name.value = user.name || ''
  aboutMe.value = user.about || ''

  if (user.avator) {
    topBlockImage.value = user.avator
  }
})
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

.top-header {
  display: flex;
  align-items: center;
  gap: calc(100vw * 16 / 375);
  padding: calc(100vh * 58 / 812) calc(100vw * 20 / 375) 0;
}

.edit-title {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  color:#000
}

.content {
  position: relative;
  width: 100vw;
  height: calc(100% - calc(100vh * 98 / 812));
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.top, .second, .third {
    display: flex;
    justify-content: center;
}

.top-block {
  width: calc(100vw * 80 / 375);
  height: calc(100vw * 80 / 375);
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: calc(100vw * 1 / 375) solid rgba(255, 255, 255, 1);
  position: relative;
  margin-top: calc(100vh * 20 / 812);
}

.camera-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: calc(100vw * 28 / 375);
  height: calc(100vw * 28 / 375);
  border-radius: 50%;
  background: rgba(255, 255, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-corner img {
  width: calc(100vw * 14 / 375);
  height: calc(100vw * 14 / 375);
}

.second-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(100vh * 10 / 812);
  width: calc(100% - calc(100vh * 40 / 812));
  margin: calc(100vh * 44 / 812) 0 0;
}

.label {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  line-height: calc(100vw * 23.1 / 375);
  color: #000;
}

.input-box {
  width: 100%;
  height: calc(100vh * 54 / 812);
  border-radius: calc(100vw * 16 / 375);
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(calc(100vw * 12 / 375));
  display: flex;
  align-items: center;
  padding: 0 calc(100vw * 15 / 375);
  box-sizing: border-box;
}

.input-box input {
  width: 100%;
  border: none;
  outline: none;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  color: #000;
  background: transparent;
}

.input-box input::placeholder {
  color: rgba(105, 71, 65, 1);
}

.third-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(100vh * 10 / 812);
  width: calc(100% - calc(100vh * 40 / 812));
  margin-top: calc(100vh * 20 / 812);
}

.about-me-box {
  height: calc(100vh * 111 / 812);
}

.about-me-box textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  color: #000;
  background: transparent;
  padding: calc(100vh * 16 / 812) 0; /* top-left padding */
  box-sizing: border-box;
}

.fourth-section {
  margin: calc(100vh * 143 / 812) 0 calc(100vh * 34 / 812);
  display: flex;
  justify-content: center;
  width: 100%;
}

.save-btn {
  width: calc(100vw * 229 / 375);
  height: calc(100vh * 62 / 812);
  border-radius: calc(100vw * 40 / 375);
  background: linear-gradient(135deg, rgba(153, 255, 214, 1) 0%, rgba(150, 222, 255, 1) 32.13%, rgba(191, 89, 255, 1) 67.84%, rgba(197, 103, 255, 1) 100%);
  box-shadow: inset calc(100vw * -2 / 375) calc(100vw * -2 / 375) calc(100vw * 2 / 375) rgba(255, 255, 255, 0.6), inset calc(100vw * 2 / 375) calc(100vw * 2 / 375) calc(100vw * 2 / 375) rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  line-height: calc(100vw * 23.1 / 375);
  letter-spacing: 0;
  color: rgba(74, 32, 25, 1);
}
</style>