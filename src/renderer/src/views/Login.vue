<template>
<div class="login  w-screen h-screen relative">
    <!-- <Particles id="tsparticles" class="login__particles" :particlesInit="particlesInit"
                :particlesLoaded="particlesLoaded" :options="particles" /> -->
     <div class="loginForm w-[400px]  absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
       <n-config-provider :theme="darkTheme">
        <div class="text-center text-white text-2xl mb-15">应急管理队伍建设信息系统</div>
         <n-form :model="form" ref="loginForm" size="large">
           <n-form-item label="账号" path="username" :rule="{required:true,type:'string',message:'请输入账号',trigger:['blur']}">
             <n-input v-model:value="form.username" :prefix-icon="User" type="text" class="form-input"  placeholder="请输入账号" />
           </n-form-item>
           <n-form-item label="密码" path="password" :rule="{required:true,type:'string',message:'请输入密码',trigger:'blur'}">
             <n-input v-model:value="form.password" :prefix-icon="Lock" type="password" class="form-input"  placeholder="请输入密码" />
           </n-form-item>
           <n-form-item label="验证码" path="code" :rule="{required:true,type:'string',message:'请输入验证码',trigger:'blur'}">
             <n-input v-model:value="form.code" :prefix-icon="Picture" type="text" class="form-input" placeholder="请输入验证码">
               <template #suffix>
                   <img :src="codeUrl" class="codeImg h-10 !w-20" @click="getCode" />
               </template>
             </n-input>
           </n-form-item>
           <n-form-item>
             <n-button type="primary"  class="w-full" @click="loginSubmit">登录</n-button>
           </n-form-item>
         </n-form>
       </n-config-provider>
      </div>
</div>
</template>
<script lang="ts" setup>
// 公钥通常用于加密会话密钥、验证数字签名，或加密可以用相应的私钥解密的数据
import { get, post } from '@/utils/fetch';
import CryptoJS from 'crypto-js';
import { darkTheme } from 'naive-ui'
import { local } from 'ux-web-storage';
import { useCommonStore } from '@/store/common';
const commonStore=useCommonStore()

// const particlesInit = async (engine:any) => {
//     await loadFull(engine);
// }

// const particlesLoaded = async (container:any) => {
//     console.log("Particles container loaded", container);
// }

// 加密方法
function Encrypt(word) {
  const key = CryptoJS.enc.Utf8.parse('1234123412ABCDEF'); // 十六位十六进制数作为密钥
  const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412'); // 十六位十六进制数作为密钥偏移量
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString().toUpperCase();
}
const router = useRouter();
const route = useRoute();
const codeUrl = ref('');
const loginForm = ref()
const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: '',
});
let loading = ref(false);

const getCode = async () => {
  // const res = await get('/code');
  // codeUrl.value = 'data:image/gif;base64,' + res.img;
  // form.uuid = res.uuid;
  form.code=''
  codeUrl.value='/gateway/ManageUser/createCodeImage?t='+Math.random()
};

const loginSubmit = async () => {
  try {
    const e = await loginForm.value.validate()
    if (e) return;
    // let setPassword = encodeAesString(form.password);
    const params = {
      username: form.username,
      password: Encrypt(form.password),
      code: form.code,
      uuid: form.uuid,
      name:form.username
    };
    const res: any = await post ('/ManageUser/login', params)
    const  {code, data } = res
    if (code ===0) {
      local.token=data
      const returnUrl = route.query.returnUrl;
      window.$message.success('登录成功')
      let url = returnUrl;
      if (decodeURIComponent(returnUrl).includes('returnUrl=')) {
        url = decodeURIComponent(returnUrl).split('returnUrl=').pop() || '/';
      }
      window.location.href = `${window.location.pathname}#${url}`;
    } else {
      getCode();
    }
    
  } catch (e) {
    getCode()
  }
};

const encodeAesString = (data) => {
  var mm = Math.random();
  let six;
  if (mm > 0.1) {
    six = Math.round(mm * 1000000);
  } else {
    mm += 0.1;
    six = Math.round(mm * 1000000);
  }
  let num = six
  var key = CryptoJS.enc.Utf8.parse('yjzhJMTTksjf2021');
  var iv = CryptoJS.enc.Utf8.parse('yjzhMMKDksjf2021');
  var encrypted = CryptoJS.AES.encrypt(num + data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();

  return encrypted;
};
// ==========================
onMounted(() => {
  getCode();
});

const particles ={
  fpsLimit: 60,
  interactivity: {
    detectsOn: 'canvas',
    events: {
      onClick: { // 开启鼠标点击的效果
        enable: true,
        mode: 'push'
      },
      onHover: { // 开启鼠标悬浮的效果(线条跟着鼠标移动)
        enable: true,
        mode: 'grab'
      },
      resize: true
    },
    modes: { // 配置动画效果
      bubble: {
        distance: 400,
        duration: 2,
        opacity: 0.8,
        size: 40
      },
      push: {
        quantity: 4
      },
      grab: {
        distance: 200,
        duration: 0.4
      },
      attract: { // 鼠标悬浮时，集中于一点，鼠标移开时释放产生涟漪效果
        distance: 200,
        duration: 0.4,
        factor: 5
      }
    }
  },
  particles: {
    color: {
      value: '#6AECFF' // 粒子点的颜色
    },
    links: {
      color: '#6AECFF', // 线条颜色
      distance: 150,
      enable: true,
      opacity: 0.5, // 不透明度
      width: 2   // 线条宽度
    },
    collisions: {
      enable: true
    },
    move: {
      attract: { enable: false, rotateX: 600, rotateY: 1200 },
      bounce: false,
      direction: 'none',
      enable: true,
      out_mode: 'out',
      random: false,
      speed: 1, // 移动速度
      straight: false
    },
    number: {
      density: {
        enable: true,
        value_area: 800
      },
      value: 80
    },
    opacity: {
      value: 0.5
    },
    shape: {
      type: 'circle'
    },
    size: {
      random: true,
      value: 5
    }
  },
  detectRetina: true
}
</script>
<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
#tsparticles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #2c3350;
  /* z-index: -10; */
}
</style>
@/utils/fetch