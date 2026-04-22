<template>
  <div class="page">
    <div class="back">
      <BackButton/>
    </div>
    <div class="page-content">
        <!-- 输入框 -->
        <div class="input-box">
          <textarea
            v-model="text"
            maxlength="150"
            class="post-textarea"
            placeholder="Please enter"
          ></textarea>
          <div class="text-count">{{ text.length }}/150</div>
        </div>
        <!-- Theme -->
        <div class="theme-label">Theme</div>
        <!-- ThemeList -->
        <div class="theme-list">
          <div v-for="(theme, index) in otherStore.other.postTheme" :key="index" class="theme-item" :class="{ selected: selectedTheme === index }" @click="selectedTheme = index"># {{ theme }}</div>
        </div>
        <!-- Upload（Pic） -->
        <div class="theme-label">Upload（Pic）</div>
        <!-- 图片上传 -->
        <div class="upload-list">
          <!-- 添加图片按钮 -->
          <label
            v-if="uploadedImagesFiles.length < maxImages"
            class="upload-item"
          >
            <input type="file" accept="image/*" multiple style="display:none" @change="handleAddImage" />
            <div class="upload-add"></div>
          </label>
          <!-- 预览已选择但未上传的图片 -->
          <template v-if="uploadedImagesFiles.length > 0">
            <label
              v-for="(file, index) in uploadedImagesFiles"
              :key="index"
              class="upload-item"
            >
              <div
                class="upload-image"
                :style="{ backgroundImage: file ? `url(${file.preview || file._previewUrl || URL.createObjectURL(file)})` : '' }"
              ></div>
              <van-icon class="upload-remove" name="clear" size="20" @click="handleRemoveImage(index)" color="#fff"/>
            </label>
          </template>
        </div>
        <!-- Release -->
        <div class="release-button" @click="handleRelease">Release</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useOtherStore } from '@/stores/other'
import { useUIStore } from '@/stores/ui'
import { usePostStore } from '@/stores/post'
import { useCurrentUserStore } from '@/stores/currentUser'
import BackButton from '@/components/back.vue'
import { uploadMultipleImages } from '@/utils/ossUpload.js'
import { goBackOrClose } from '@/utils/iosBridge'
import { requireLoginForAction } from '@/utils/guestAuth'

const text = ref('')
const selectedTheme = ref(0)

const otherStore = useOtherStore()

const maxImages = 5
const uploadedImagesFiles = ref([]) // store selected File objects (local preview only)

const handleAddImage = (event) => {
  const files = Array.from(event.target.files)
  const remaining = maxImages - uploadedImagesFiles.value.length
  const toAdd = files.slice(0, remaining).map(file => {
    file.preview = window.URL.createObjectURL(file) // local preview only
    return file
  })
  uploadedImagesFiles.value.push(...toAdd)
}

const handleRemoveImage = (index) => {
  uploadedImagesFiles.value.splice(index, 1)
}

const uiStore = useUIStore()
const postStore = usePostStore()
const currentUserStore = useCurrentUserStore()
const handleRelease = async () => {
  if (requireLoginForAction(currentUserStore, uiStore, {
    message: 'Guests need to log in before publishing posts.'
  })) return

  if (!text.value.trim()) {
    uiStore.showToast('Please fill in the post text.')
    return
  }
  if (!uploadedImagesFiles.value.length) {
    uiStore.showToast('Please select at least one image.')
    return
  }

  if (uiStore.loading) return
  uiStore.showLoading()

  try {
    // 上传图片到 OSS
    const urls = await uploadMultipleImages(uploadedImagesFiles.value, 'template_development')

    // 构造新帖子对象
    const newPost = {
      dynamicId: String(postStore.posts.length + 1), // 生成唯一ID
      userId: currentUserStore.currentUser.userId, // 可以替换为当前用户ID
      dynamicType: 0,
      dynamicDesc: text.value,
      dynamicTitleType: selectedTheme.value,
      dynamicPic: urls,
      dynamicVideo: '', // 如果有视频可以赋值
      dynamicLikeCount: 0,
      dynamicCommentCount: 0
    }

    // 添加到帖子列表
    postStore.addPost(newPost)

    uiStore.showToast('Post released successfully')
    goBackOrClose()
    
  } catch (err) {
    console.error('上传失败', err)
    uiStore.showToast('Upload failed, please check your network.')
  } finally {
    uiStore.hideLoading()
  }
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
}

.back {
    padding-top: calc(100vh * 56 / 812);
    padding-left: calc(100vw * 20 / 375);
}

.page-content {
  position: relative;
  width: 100vw;
  height: calc(100vh - calc(100vh * 96 / 812));
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.input-box {
  position: relative;
  margin-top: calc(100vh * 20 / 812);
  margin-left: calc(100vw * 20 / 375);
  margin-right: calc(100vw * 20 / 375);
  height: calc(100vh * 174 / 812);
  border-radius: calc(100vw * 16 / 375);
  background: rgba(255, 255, 255, 1);
  padding: calc(100vw * 12 / 375);
  box-sizing: border-box;
}

.post-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  background: transparent;
  color: #000;
}

.post-textarea::placeholder {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  color: rgba(105, 71, 65, 1); /* 颜色可半透明 */
}

.text-count {
  position: absolute;
  right: calc(100vw * 14 / 375);
  bottom: calc(100vh * 19 / 812);
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: normal;
  color: rgba(105, 71, 65, 1);
}

.theme-label {
  margin-top: calc(100vh * 24 / 812);
  margin-left: calc(100vw * 20 / 375);
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  line-height: calc(100vw * 23.1 / 375);
  color: rgba(255, 255, 255, 1);
  text-align: left;
}

.theme-list {
  display: flex;
  justify-content: flex-start;
  gap: calc(100vw * 11 / 375);
  margin-left: calc(100vw * 20 / 375);
  margin-top: calc(100vh * 20 / 812);
}

.theme-item {
  width: calc(100vw * 94 / 375);
  height: calc(100vh * 44 / 812);
  border-radius: calc(100vw * 20 / 375);
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  letter-spacing: 0;
  color: rgba(255, 255, 255, 1);
  cursor: pointer;
}

.theme-item.selected {
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  color: rgba(74, 32, 25, 1);
}

.upload-list {
  display: flex;
  overflow-x: auto;
  margin-top: calc(100vh * 20 / 812);
  padding-left: calc(100vw * 20 / 375);
  padding-right: calc(100vw * 20 / 375);
  gap: calc(100vw * 10 / 375); /* 间距10，当有图片时 */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}
.upload-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.upload-item {
  width: calc(100vw * 108 / 375);
  height: calc(100vw * 108 / 375);
  flex-shrink: 0;
  border-radius: calc(100vw * 20 / 375);
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.upload-add {
  width: calc(100vw * 21 / 375);
  height: calc(100vw * 21 / 375);
  background-image: url('@/assets/uploadpic.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin: auto;
}

.upload-remove {
  position: absolute;
  top: calc(100vh * 8 / 812);
  right: calc(100vw * 5 / 375);
  width: calc(100vw * 20 / 375);
  height: calc(100vw * 20 / 375);
  cursor: pointer;
  z-index: 10;
}

/* Release Button Styles */
.release-button {
  width: calc(100vw * 229 / 375);
  height: calc(100vh * 62 / 812);
  border-radius: calc(100vw * 40 / 375);
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  box-shadow: inset calc(100vw * -2 / 375) calc(100vw * -2 / 375) calc(100vw * 2 / 375) rgba(255, 255, 255, 0.6), inset calc(100vw * 2 / 375) calc(100vw * 2 / 375) calc(100vw * 2 / 375) rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  font-weight: 400;
  line-height: calc(100vw * 23.1 / 375);
  color: rgba(74, 32, 25, 1);
  cursor: pointer;
  margin: calc(100vh * 117 / 812) auto calc(100vh * 34 / 812) auto;
}
</style>
