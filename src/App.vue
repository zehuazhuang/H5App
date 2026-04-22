<script setup>
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
</script>

<template>
  <div>
    <router-view />

    <!-- 全局 loading -->
    <div v-if="uiStore.loading" class="loading-mask">
      <div class="loading-box">
        <van-loading type="spinner" size="32px" color="#fff" />
      </div>
    </div>

    <!-- 全局 toast -->
    <div v-if="uiStore.toastMessage" class="global-toast">
      {{ uiStore.toastMessage }}
    </div>

    <div
      v-if="uiStore.loginDialogVisible"
      class="login-dialog-mask"
      @click.self="uiStore.closeLoginDialog()"
    >
      <div class="login-dialog-shell">
        <div class="login-dialog">
          <div class="login-dialog-title">{{ uiStore.loginDialogTitle }}</div>
          <div class="login-dialog-message">{{ uiStore.loginDialogMessage }}</div>
          <button class="login-dialog-btn login-dialog-btn-confirm" @click="uiStore.confirmLoginDialog()">
            {{ uiStore.loginDialogConfirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5); /* 半透明遮罩 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-box {
  width: calc(100vw * 80 / 375);
  height: calc(100vw * 80 / 375);
  border-radius: calc(100vw * 20 / 812);
  background: rgba(0,0,0,1); /* 黑色小背景 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.global-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: calc(100vh * 12 / 812) calc(100vw * 24 / 375);
  border-radius: calc(100vw * 12 / 375);
  font-size: calc(100vw * 14 / 375);
  z-index: 10000;
  text-align: center;
}

.login-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 calc(100vw * 24 / 375);
  z-index: 10001;
}

.login-dialog-shell {
  width: 100%;
  max-width: calc(100vw * 340 / 375);
  padding: calc(100vw * 12 / 375);
  border-radius: calc(100vw * 48 / 375);
  background: linear-gradient(90deg, #aa57f6 0%, #af54f6 40%, #bb53ef 100%);
  transform: rotate(4deg);
  box-sizing: border-box;
}

.login-dialog {
  min-height: calc(100vw * 352 / 375);
  border-radius: calc(100vw * 44 / 375);
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
  border: calc(100vw * 8 / 375) solid rgba(177, 222, 255, 0.95);
  transform: rotate(-4deg);
  padding: calc(100vh * 72 / 812) calc(100vw * 26 / 375) calc(100vh * 52 / 812);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-dialog-title {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 34 / 375);
  line-height: 1.2;
  color: #0d0b16;
  text-align: center;
  font-style: italic;
  font-weight: 700;
}

.login-dialog-message {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 16 / 375);
  line-height: 1.35;
  color: #1b1823;
  text-align: center;
  margin-top: calc(100vh * 34 / 812);
  max-width: calc(100vw * 240 / 375);
}

.login-dialog-btn {
  border: none;
  font-family: 'Archivo', sans-serif;
  cursor: pointer;
}

.login-dialog-btn-confirm {
  margin-top: auto;
  width: calc(100vw * 180 / 375);
  height: calc(100vh * 64 / 812);
  border-radius: calc(100vw * 999 / 375);
  background: linear-gradient(90deg, #8fe8df 0%, #9acbf9 30%, #b96dff 100%);
  color: #fff;
  font-weight: 600;
  font-size: calc(100vw * 30 / 375);
  font-style: italic;
  box-shadow: 0 calc(100vh * 10 / 812) calc(100vw * 24 / 375) rgba(185, 109, 255, 0.28);
}
</style>
