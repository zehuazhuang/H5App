<template>
  <div class="page">
    <div class="top-header">
      <BackButton />
      <span class="page-title">Edit</span>
    </div>

    <div class="content">
      <div class="avatar-section">
        <div class="avatar-box" :style="{ backgroundImage: `url(${avatarPreview})` }" @click="chooseAvatar">
          <div class="avatar-switch">
            <img src="@/assets/cameraicon.png" alt="switch avatar" />
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display:none"
          @change="onFileChange"
        />
      </div>

      <div class="form-section">
        <div class="label">Name</div>
        <div class="input-box">
          <input v-model="name" type="text" placeholder="Please enter" />
        </div>
      </div>

      <div class="form-section">
        <div class="label">Birthday</div>
        <label class="input-box select-box">
          <span class="date-display">{{ formatBirthday(birthday) }}</span>
          <input v-model="birthdayRaw" type="date" class="date-input" @change="handleBirthdayChange" />
          <span class="select-arrow"></span>
        </label>
      </div>

      <div class="form-section">
        <div class="label">Location</div>
        <label class="input-box select-box">
          <select v-model="location">
            <option v-for="item in locations" :key="item" :value="item">{{ item }}</option>
          </select>
          <span class="select-arrow"></span>
        </label>
      </div>

      <div class="form-section">
        <div class="label">Gender:</div>
        <div class="gender-list">
          <div
            v-for="item in genderOptions"
            :key="item.value"
            :class="['gender-item', { active: gender === item.value }]"
            @click="gender = item.value"
          >
            <div class="gender-avatar" :style="{ backgroundImage: `url(${item.avatar})` }"></div>
          </div>
        </div>
      </div>

      <div class="submit-wrap">
        <div class="submit-btn" @click="handleNext">Next</div>
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
import { goBackOrClose, sendNewSignupToIOS } from '@/utils/iosBridge'
import { uploadSingleImage } from '@/utils/ossUpload'
import avatarPlaceholder from '@/assets/avataricon.png'
import signupGenderFemale from '@/assets/signup-gender-female.png'
import signupGenderMale from '@/assets/signup-gender-male.png'

const userStore = useUserStore()
const currentUserStore = useCurrentUserStore()
const uiStore = useUIStore()

const fileInput = ref(null)
const avatarFile = ref(null)
const avatarPreview = ref(avatarPlaceholder)
const name = ref('')
const birthday = ref('2003-1-1')
const birthdayRaw = ref('2003-01-01')
const location = ref('United States')
const gender = ref('female')

const locations = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'New Zealand',
  'France',
  'Germany',
  'Italy',
  'Spain',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  'Ireland',
  'Portugal',
  'Belgium',
  'Austria',
  'Japan',
  'South Korea',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Philippines',
  'Indonesia',
  'Vietnam',
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
  'South Africa',
  'Turkey'
]

const genderOptions = [
  {
    value: 'female',
    avatar: signupGenderFemale
  },
  {
    value: 'male',
    avatar: signupGenderMale
  }
]

function chooseAvatar() {
  fileInput.value?.click()
}

function onFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  avatarFile.value = file

  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function formatBirthday(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month}-${day}`
}

function normalizeBirthdayRaw(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function handleBirthdayChange() {
  birthday.value = formatBirthday(birthdayRaw.value)
}

async function handleNext() {
  if (!avatarFile.value && avatarPreview.value === avatarPlaceholder) {
    uiStore.showToast('Please select avatar')
    return
  }

  if (!name.value.trim()) {
    uiStore.showToast('Please enter name')
    return
  }

  if (!birthday.value) {
    uiStore.showToast('Please select birthday')
    return
  }

  if (!location.value) {
    uiStore.showToast('Please select location')
    return
  }

  if (uiStore.loading) return
  uiStore.showLoading()

  let avatarUrl = avatarPreview.value

  try {
    if (avatarFile.value) {
      avatarUrl = await uploadSingleImage(avatarFile.value, 'template_development')
    }

    const payload = {
      avator: avatarUrl,
      name: name.value,
      birthday: birthday.value,
      location: location.value,
      gender: gender.value
    }

    const delay = avatarFile.value ? 0 : Math.floor(Math.random() * 1200) + 300

    setTimeout(() => {
      userStore.updateUser(currentUserStore.currentUser.userId, payload)
      uiStore.hideLoading()
      sendNewSignupToIOS({
        name: name.value,
        avator: avatarUrl
      })
      uiStore.showToast('Profile updated')
      goBackOrClose()
    }, delay)
  } catch (error) {
    console.error(error)
    uiStore.hideLoading()
    uiStore.showToast('Updated failed, please check your network.')
  }
}

onMounted(() => {
  const user = currentUserStore.currentUser
  if (!user) return

  name.value = user.name || ''
  birthday.value = user.birthday || '2003-1-1'
  birthdayRaw.value = normalizeBirthdayRaw(user.birthday || '2003-1-1')
  location.value = user.location || 'United States'
  gender.value = user.gender || 'female'
  avatarPreview.value = user.avator || avatarPlaceholder
})
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #000;
  background-image: url('@/assets/pagebgc.png');
  background-size: cover;
  background-position: center;
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

.page-title {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-style: italic;
  color: #000;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: calc(100vh * 20 / 812) calc(100vw * 20 / 375) calc(100vh * 28 / 812);
  box-sizing: border-box;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: calc(100vh * 30 / 812);
}

.avatar-box {
  position: relative;
  width: calc(100vw * 80 / 375);
  height: calc(100vw * 80 / 375);
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: calc(100vw * 1 / 375) solid #fff;
}

.avatar-switch {
  position: absolute;
  right: calc(100vw * -3 / 375);
  bottom: calc(100vw * -2 / 375);
  width: calc(100vw * 28 / 375);
  height: calc(100vw * 28 / 375);
  border-radius: 50%;
  background: linear-gradient(135deg, #8cecdf 0%, #c558ff 100%);
  padding: calc(100vw * 2 / 375);
  box-sizing: border-box;
}

.avatar-switch img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  padding: calc(100vw * 6 / 375);
  box-sizing: border-box;
}

.form-section {
  margin-bottom: calc(100vh * 22 / 812);
}

.label {
  margin-bottom: calc(100vh * 10 / 812);
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-style: italic;
  color: #000;
}

.input-box {
  position: relative;
  width: 100%;
  height: calc(100vh * 54 / 812);
  border-radius: calc(100vw * 16 / 375);
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;
  padding: 0 calc(100vw * 15 / 375);
  box-sizing: border-box;
}

.input-box input,
.input-box select {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  color: rgba(0, 0, 0, 0.72);
  appearance: none;
}

.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.date-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.date-display {
  width: 100%;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  color: rgba(0, 0, 0, 0.72);
}

.input-box input::placeholder {
  color: rgba(0, 0, 0, 0.28);
}

.select-box {
  padding-right: calc(100vw * 42 / 375);
}

.date-input {
  color-scheme: light;
}

.select-arrow {
  position: absolute;
  right: calc(100vw * 16 / 375);
  top: 50%;
  transform: translateY(-35%);
  width: 0;
  height: 0;
  border-left: calc(100vw * 7 / 375) solid transparent;
  border-right: calc(100vw * 7 / 375) solid transparent;
  border-top: calc(100vw * 12 / 375) solid #c558ff;
  pointer-events: none;
}

.gender-list {
  display: flex;
  align-items: center;
  gap: calc(100vw * 18 / 375);
  padding-top: calc(100vh * 4 / 812);
}

.gender-item {
  width: calc(100vw * 80 / 375);
  height: calc(100vw * 80 / 375);
  border-radius: 50%;
  padding: calc(100vw * 4 / 375);
  box-sizing: border-box;
}

.gender-item.active {
  background: linear-gradient(135deg, #8cecdf 0%, #c558ff 100%);
}

.gender-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: #fff;
}

.submit-wrap {
  padding: calc(100vh * 24 / 812) calc(100vw * 24 / 375) calc(100vh * 12 / 812);
}

.submit-btn {
  width: 100%;
  height: calc(100vh * 54 / 812);
  border-radius: calc(100vw * 999 / 375);
  border: calc(100vw * 4 / 375) solid #fff;
  background: linear-gradient(90deg, #8cecdf 0%, #9dc6ff 30%, #c558ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-style: italic;
  color: #fff;
  box-sizing: border-box;
}
</style>
