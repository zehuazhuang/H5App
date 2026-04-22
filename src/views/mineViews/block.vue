<template>
  <div class="page">
    <div class="top-header">
      <BackButton />
      <span class="edit-title">Blacklist</span>
    </div>
    <!-- 黑名单列表 -->
    <div class="container">
        <div class="block-list" v-if="blocks.length > 0">
            <div v-for="(item, index) in blocks" :key="index" class="block-item">
                <div class="block-left">
                    <div class="user-info">
                        <div class="avatar-box">
                            <div class="avatar-inner">
                                <img :src="item.avator" alt="avatar" />
                            </div>
                        </div>
                        <div class="user-name">{{ item.name }}</div>
                    </div>
                    <div class="user-intro">{{ item.about }}</div>
                </div>
                <div class="block-right" @click="removeBlock(item.userId)">Remove</div>
            </div>
        </div>
        <Empty v-else class="empty" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCurrentUserStore } from '@/stores/currentUser'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'
import BackButton from '@/components/back.vue'
import Empty from '@/components/empty.vue'

const currentUserStore = useCurrentUserStore()
const userStore = useUserStore()
const uiStore = useUIStore()

const blocks = computed(() => {
  return currentUserStore.currentUser?.blockList?.map(userId => {
    // Here you can map userId to user info if you have a userStore
    // For now we return placeholder data
    return userStore.getUserById(userId)
  }) || []
})

function removeBlock(userId) {
  const currentUser = currentUserStore.currentUser
  if (!currentUser || !currentUser.blockList) return

  if (uiStore.loading) return
  uiStore.showLoading()

  const index = currentUser.blockList.indexOf(userId)
  
  const delay = Math.floor(Math.random() * 1500) + 500

  setTimeout(() => {

    if (index !== -1) {
      currentUser.blockList.splice(index, 1)
      userStore.updateUser(currentUser.userId, { blockList: currentUser.blockList })
    }

    uiStore.hideLoading()
    
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

.container {
  flex: 1;
  overflow-y: auto;
  margin: calc(100vh * 20 / 812) 0 0;
  box-sizing: border-box;
}

.block-list {
  margin: 0 calc(100vw * 20 / 375) 0;
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 16 / 812);
  padding-bottom: calc(100vh * 34 / 812);
}

.block-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: calc(100vh * 76 / 812);
  border-radius: calc(100vw * 20 / 375);
  background: #fff;
  box-shadow: 0px calc(100vw * 2 / 375) calc(100vw * 4 / 375) rgba(0, 0, 0, 0.06);
  padding: 0 calc(100vw * 16 / 375);
  box-sizing: border-box;
}

.block-left {
  width: calc(100% - calc(100vw * 140 / 375));
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  gap: calc(100vh * 7 / 812);
}

.user-info {
  display: flex;
  align-items: center;
  gap: calc(100vw * 12 / 375);
}

.avatar-box {
  flex-shrink: 0; /* 禁止收缩 */
  width: calc(100vw * 32 / 375);
  height: calc(100vw * 32 / 375);
  border-radius: 50%;
  padding: calc(100vw * 1 / 375);
  background: linear-gradient(135deg, rgba(255, 159, 142, 1) 0%, rgba(241, 213, 160, 1) 32.13%, rgba(201, 255, 221, 1) 67.84%, rgba(157, 255, 255, 1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
}

.avatar-inner img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 18.48 / 375);
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-intro {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.block-right {
  width: calc(100vw * 63 / 375);
  height: calc(100vh * 28 / 812);
  border-radius: calc(100vw * 20 / 375);
  background: #fff;
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 12 / 375);
  font-weight: 400;
  line-height: calc(100vw * 13.06 / 375);
  color: rgba(105, 71, 65, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>