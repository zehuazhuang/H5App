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
        <!-- Upload（video） -->
        <div class="theme-label">Upload（video）</div>
        <!-- 视频上传 -->
        <div class="upload-list">
          <!-- 添加视频按钮 -->
          <label v-if="!uploadedVideo" class="upload-item">
            <input type="file" accept="video/*" style="display:none" @change="handleAddVideo" />
            <div class="upload-add"></div>
          </label>

          <!-- 已上传的视频第一帧显示 -->
          <template v-if="uploadedVideo">
            <label class="upload-item">
              <img class="upload-video-preview" :src="videoFirstFrame" alt="video preview" />
              <van-icon class="upload-remove" name="clear" size="20" @click="handleRemoveVideo" color="#fff"/>
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
import { uploadSingleImage, uploadVideo } from '@/utils/ossUpload'
import { goBackOrClose } from '@/utils/iosBridge'
import { requireLoginForAction } from '@/utils/guestAuth'

const text = ref('')
const selectedTheme = ref(0)

const otherStore =  useOtherStore()
const uiStore = useUIStore()
const postStore = usePostStore()
const currentUserStore = useCurrentUserStore()

const uploadedVideo = ref(null)  // store the video file
const videoFirstFrame = ref('') // store the preview image

const handleAddVideo = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadedVideo.value = file;

  // 使用 URL.createObjectURL(file) 创建临时 URL
  const videoUrl = URL.createObjectURL(file);

  console.log(videoUrl);
  // 获取首帧封面
  videoFirstFrame.value = await getVideoInfo(videoUrl);

  // 释放 URL，防止内存泄漏
  // URL.revokeObjectURL(videoUrl); // 可在确认首帧生成后释放
};

const handleRemoveVideo = () => {
  uploadedVideo.value = null
  videoFirstFrame.value = ''
}

const handleRelease = async () => {
  if (requireLoginForAction(currentUserStore, uiStore)) return

  // 1. 判断文案是否为空
  if (!text.value.trim()) {
    uiStore.showToast('Please fill in the post text.')
    return
  }

  if (!uploadedVideo.value) {
    uiStore.showToast('Please select a video.')
    return
  }

  if (uiStore.loading) return
  uiStore.showLoading()

  try {
    // 2. 上传视频
    const videoUrl = await uploadVideo(uploadedVideo.value,'template_development')
    console.log('视频 URL:', videoUrl)

    // 3. 上传视频第一帧图片
    const imageBlob = await (await fetch(videoFirstFrame.value)).blob()
    const imageFile = new File([imageBlob], 'first_frame.png', { type: 'image/png' })
    const imageUrl = await uploadSingleImage(imageFile,'template_development')
    console.log('视频第一帧 URL:', imageUrl)

    // 构造新帖子对象
    const newPost = {
      dynamicId: String(postStore.posts.length + 1), // 生成唯一ID
      userId: currentUserStore.currentUser.userId, // 可以替换为当前用户ID
      dynamicType: 1,
      dynamicDesc: text.value,
      dynamicTitleType: 0,
      dynamicPic: [imageUrl],
      dynamicVideo: videoUrl, // 如果有视频可以赋值
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

const getVideoInfo = async (videoUrl) => {
  return new Promise((resolve) => {
    let video = document.createElement("video");
    video.src = videoUrl;
    video.currentTime = 0.1; // 截取首帧
    video.preload = "metadata";

    video.addEventListener("loadeddata", async () => {
      let canvas = document.createElement("canvas"),
          width = video.videoWidth,
          height = video.videoHeight;

      canvas.width = width;
      canvas.height = height;

      // 等 100ms 渲染完成
      await new Promise((r) => setTimeout(r, 100));

      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

      const thumb = canvas.toDataURL("image/jpeg");

      // 释放资源
      canvas.width = 0;
      canvas.height = 0;
      video.src = "";
      video.load();
      video.remove();
      video = null;
      canvas = null;

      resolve(thumb);
    });
  });
};
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 1);
  color:#000;
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

.upload-video-preview {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
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
  margin: calc(100vh * 148 / 812) auto calc(100vh * 34 / 812) auto;
}
</style>
