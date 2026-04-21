<template>
  <div class="agreement-page">

    <!-- header -->
    <div class="header">
      <BackButton />
      <div class="title">Privacy Policy</div>
    </div>

    <!-- content -->
    <div class="agreement-content">

      <h1>Sehi Privacy Policy</h1>
      <p class="update-time">Last updated: 2026</p>

      <p>
        Welcome to <strong>Sehi</strong>. Your privacy is very important to us.
        This Privacy Policy explains how Sehi collects, uses, and protects
        your information when you use our application and services.
      </p>

      <h2>1. Information We Collect</h2>

      <p>We may collect the following types of information:</p>

      <ul>
        <li>Account information such as username, profile photo, and email</li>
        <li>Device information including device model, operating system, and identifiers</li>
        <li>Usage data such as interactions, messages, and app activity</li>
        <li>Payment-related information when purchasing virtual items</li>
      </ul>

      <h2>2. How We Use Information</h2>

      <p>The information we collect may be used to:</p>

      <ul>
        <li>Provide and improve Sehi services</li>
        <li>Personalize user experience</li>
        <li>Ensure platform safety and prevent fraud</li>
        <li>Process payments and virtual item purchases</li>
        <li>Communicate updates and service notifications</li>
      </ul>

      <h2>3. Information Sharing</h2>

      <p>
        Sehi does not sell or rent your personal information. We may share
        information only in the following situations:
      </p>

      <ul>
        <li>With service providers that support our platform operations</li>
        <li>When required by law or legal processes</li>
        <li>To protect the safety and rights of users or the platform</li>
      </ul>

      <h2>4. Data Security</h2>

      <p>
        We implement reasonable technical and organizational measures to
        protect your information from unauthorized access, alteration,
        disclosure, or destruction.
      </p>

      <h2>5. Data Retention</h2>

      <p>
        We retain user data only for as long as necessary to provide services
        and comply with legal obligations.
      </p>

      <h2>6. Children's Privacy</h2>

      <p>
        Sehi is not intended for individuals under the age required by
        applicable law. We do not knowingly collect personal information
        from children.
      </p>

      <h2>7. User Rights</h2>

      <p>Depending on your location, you may have rights to:</p>

      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction or deletion of your data</li>
        <li>Restrict or object to certain processing</li>
      </ul>

      <h2>8. Changes to This Policy</h2>

      <p>
        Sehi may update this Privacy Policy from time to time.
        Continued use of the service after changes indicates
        acceptance of the updated policy.
      </p>

      <h2>9. Contact Us</h2>

      <p>
        If you have questions about this Privacy Policy,
        please contact us through the support channel
        provided within the Sehi application.
      </p>

    </div>
  </div>
</template>

<script setup>
import BackButton from '@/components/back.vue'
</script>

<style scoped>
.agreement-page{
  width:100%;
  height:100vh;
  display:flex;
  flex-direction:column;
  background-image:url('@/assets/pagebgc.png');
  background-size:cover;
  background-position:center;
  color:white;
}

/* 顶部 */
.header{
  display:flex;
  align-items:center;
  gap:calc(100vw * 16 / 375);
  padding:calc(100vh * 58 / 812) calc(100vw * 20 / 375) calc(100vh * 20 / 812);
}

.title{
  font-family: 'YesevaOne', sans-serif;
  font-size: calc(100vw * 20 / 375);
  background:linear-gradient(
    135deg,
    rgba(255,159,142,1),
    rgba(241,213,160,1),
    rgba(201,255,221,1),
    rgba(157,255,255,1)
  );
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

/* 内容 */
.agreement-content{
  flex:1;
  overflow-y:auto;
  padding:calc(100vh * 20 / 812) calc(100vw * 20 / 375);
  background:rgba(0,0,0,0.45);
  backdrop-filter:blur(calc(100vw * 10 / 375));
  border-radius:calc(100vw * 20 / 375) calc(100vw * 20 / 375) 0 0;
}

/* 标题 */
.agreement-content h1{
  font-family: 'YesevaOne', sans-serif;
  font-size:calc(100vw * 24 / 375);
  margin-bottom:calc(100vh * 10 / 812);
}

/* 更新时间 */
.update-time{
  opacity:0.7;
  font-family: 'YesevaOne', sans-serif;
  font-size:calc(100vw * 12 / 375);
  margin-bottom:calc(100vh * 20 / 812);
}

/* 小标题 */
.agreement-content h2{
  font-family: 'YesevaOne', sans-serif;
  font-size:calc(100vw * 18 / 375);
  margin-top:calc(100vh * 24 / 812);
  margin-bottom:calc(100vh * 10 / 812);
  color:#ff9f8e;
}

/* 正文 */
.agreement-content p{
  font-family: 'Archivo', sans-serif;
  font-size:calc(100vw * 14 / 375);
  line-height:1.7;
  margin-bottom:calc(100vh * 10 / 812);
}

/* 列表 */
.agreement-content ul{
  padding-left:calc(100vw * 18 / 375);
}

.agreement-content li{
  margin-bottom:calc(100vh * 6 / 812);
  font-family: 'Archivo', sans-serif;
  font-size:calc(100vw * 14 / 375);
}
</style>