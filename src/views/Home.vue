<template>
  <div class="page">
    <img class="bg-img" src="../assets/bg.webp" alt="" />

    <div class="email-box">
      <div class="email">
        havanhung3562@icloud.com
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
}

.bg-img {
  width: 100%;
  object-fit: cover;
}

.email-box {
  position: absolute;
  bottom: 5vh;
  width: 100%;
  display: flex;
  justify-content: center;
}

.email {
  background: white;
  color: black;
  padding: 1.3vh 2vw;
  border-radius: 1vw;
  font-size: 2vw;
}
</style>