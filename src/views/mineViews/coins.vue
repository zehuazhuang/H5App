<template>
  <div class="page">
    <div class="top-header">
      <BackButton />
      <span class="edit-title">My diamonds</span>
    </div>

    <!-- 金币盒子UI -->
    <div class="coin-box">
      <div class="coin-box-header">My diamonds</div>
      <div class="coin-box-content">
        <img src="@/assets/coin.png" alt="coin" class="coin-icon" />
        <span class="coin-number">{{ currentUserStore.currentUser.coins }}</span>
      </div>
    </div>
    <div class="coinbgc"></div>
    <!-- 金币列表 -->
    <div class="coins">
      <div class="coin-list">
        <div
          v-for="(item,index) in otherStore.other.coinsSetting"
          :key="index"
          class="coin-item"
          :class="{ 'coin-item-selected': selectedIndex === index }"
          @click="() => { selectedIndex = index; handleCoinClick(item) }"
        >
          <div class="coin-left">
            <img src="@/assets/coin.png" class="coin-item-icon" />
            <span class="coin-count" :class="{ 'coin-count-selected': selectedIndex === index }">{{ item.cions }}</span>
          </div>

          <div class="coin-right">
            <span class="coin-price" :class="{ 'coin-price-selected': selectedIndex === index }">{{ item.money }}</span>
            <div class="coin-radio" :class="{ 'coin-radio-selected': selectedIndex === index }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BackButton from '@/components/back.vue'
import { useOtherStore } from '@/stores/other'
import { useCurrentUserStore } from '@/stores/currentUser'
import { useUserStore } from '@/stores/user'
import { sendPaymentToIOS } from '@/utils/iosBridge'

const otherStore =  useOtherStore()
const currentUserStore = useCurrentUserStore()
const userStore =  useUserStore()

const selectedIndex = ref(-1)

function handleCoinClick(item) {
  // item.key 或 item.id 作为支付标识
  const payKey = item.key

  // 调用 iOS 支付
  sendPaymentToIOS(payKey)
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
  /* display: flex;
  flex-direction: column; */
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
  color: #000; /* 黑色 */
}

/* 金币盒子外层 */
.coin-box {
  width: auto;
  height: calc(100vh * 103 / 812);
  border-radius: calc(100vw * 20 / 375);
  
  background-image: url('@/assets/coinbgc.png');
  background-size: cover; /* 等比缩放覆盖 */
  background-position: center; /* 居中显示 */
  background-repeat: no-repeat;
  overflow: hidden;
  margin: calc(100vh * 20 / 812) calc(100vw * 20 / 375) 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(100vh * 10 / 812);
  padding-left: calc(100vw * 13 / 375);
}


/* 上部分标题 */
.coin-box-header {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 18 / 375);
  font-weight: 400;
  letter-spacing: 0px;
  line-height: calc(100vw * 20.79 / 375);
  color: rgba(74, 32, 25, 1);
}

/* 下部分盒子内容 */
.coin-box-content {
  display: inline-flex;       /* 内部内容水平排列 */
  align-items: center;
  justify-content: flex-start;
  border-radius: calc(100vw * 40 / 375);
  background: rgba(74, 32, 25, 1);
  border: calc(100vw * 2 / 375) solid rgba(201, 255, 221, 1);
  padding: calc(100vh * 10 / 812) calc(100vw * 22 / 375);
  gap: calc(100vw * 8 / 375);

  width: fit-content;         /* 核心：宽度自适应内容 */
  max-width: 100%;            /* 避免内容超出父容器 */
  margin-left: 0;             /* 可选：左对齐 */
  margin-right: 0;            /* 可选：右对齐 */
}

/* coin 图标 */
.coin-icon {
  width: calc(100vw * 20 / 375);
  height: calc(100vh * 24 / 812);
}

/* 金币数量文字 */
.coin-number {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  letter-spacing: 0px;
  line-height: calc(100vw * 17.41 / 375);
  color: rgba(255, 255, 255, 1);
}


 
.coins {
  height: calc(100% - calc(100vh * 285 / 812));
  margin-top: calc(100vh * 30 / 812);
  padding: 0 calc(100vw * 20 / 375) calc(100vh * 34 / 812);
  overflow-y: auto;
}

.coin-list {
  display: flex;
  flex-direction: column;
  gap: calc(100vh * 12 / 812);
}

.coin-item {
  height: calc(100vh * 64 / 812);
  border-radius: calc(100vw * 20 / 375);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px calc(100vw * 2 / 375) calc(100vw * 4 / 375) rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 calc(100vw * 10 / 375);
  box-sizing: border-box;
}

.coin-item-selected {
  border-radius: calc(100vw * 20 / 375);
  background: rgba(255, 159, 142, 1);
  border: calc(100vw * 2 / 375) solid rgba(201, 255, 221, 1);
}

.coin-left {
  display: flex;
  align-items: center;
  gap: calc(100vw * 8 / 375);
}

.coin-item-icon {
  width: calc(100vw * 28 / 375);
  height: calc(100vh * 34 / 812);
}

.coin-count {
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 16 / 375);
  font-weight: 400;
  line-height: calc(100vw * 18.48 / 375);
  color: rgba(74, 32, 25, 1);
}

.coin-count-selected {
  color: #fff;
}

.coin-right {
  display: flex;
  align-items: center;
  gap: calc(100vw * 10 / 375);
}

.coin-price {
  font-family: 'Archivo', sans-serif;
  font-size: calc(100vw * 14 / 375);
  font-weight: 400;
  line-height: calc(100vw * 15.23 / 375);
  color: rgba(105, 71, 65, 1);
}

.coin-price-selected {
  color: #FFF;
}

.coin-radio {
  width: calc(100vw * 15 / 375);
  height: calc(100vw * 15 / 375);
  border-radius: 50%;
  background: rgba(105, 71, 65, 1);
}

.coin-radio-selected {
  width: calc(100vw * 14 / 375);
  height: calc(100vw * 14 / 375);
  background: linear-gradient(
    135deg,
    rgba(255, 159, 142, 1) 0%,
    rgba(241, 213, 160, 1) 32.13%,
    rgba(201, 255, 221, 1) 67.84%,
    rgba(157, 255, 255, 1) 100%
  );
  border: calc(100vw * 1 / 375) solid rgba(255, 255, 255, 1);
}
</style>