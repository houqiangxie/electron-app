<!--
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-03-10 12:24:17
 * @LastEditors: houqiangxie
 * @LastEditTime: 2023-10-11 15:04:04
-->
<template>
  <n-config-provider :theme="lightTheme" :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-dialog-provider>
    <n-message-provider>
      <RegisterMessage />
    </n-message-provider>
    </n-dialog-provider>
      <n-spin :show="commonStore.showLoading">
        <template #default>
          <div class="absolute top-0 left-0 w-full h-[60px] border-b flex justify-between items-center	" v-if="!route.meta.hiddenNavBar">
            <div class='flex'>
              <img src="@/assets/images/logo.png" style="height:50px; margin-top:4px; margin-left:6px;">
              <p class="text-2xl leading-[60px] text-[#333399] font-bold"></p>
            </div>
          </div>
          <n-dropdown :options="userDropDownOptions" :on-select="userDropSelect">
            <!-- <n-button>用户资料</n-button> -->
            <div class="absolute top-0 right-5 h-15 flex items-center"><svg class="icon text-xl text-[#666666]" aria-hidden="true"><use xlink:href="#icon-zhanghao"></use></svg><span>{{getUserName()}}</span></div>
          </n-dropdown>
          <div class=" w-screen h-screen">
            <router-view></router-view>
          </div>
        </template>
      </n-spin>
  </n-config-provider>
</template>

<script setup lang="ts">
import { lightTheme, zhCN, dateZhCN, GlobalThemeOverrides } from 'naive-ui';
// @ts-ignore：无法被执行的代码的错误
import customTheme from '@/assets/nativeCustomTheme/customTheme.json';
import { useCommonStore } from '@/store/common';
import { local } from 'ux-web-storage';
const commonStore = useCommonStore();
const themeOverrides: GlobalThemeOverrides = customTheme;
const route:any = useRoute();
const router:any = useRouter();
if (document.getElementById('Loading')) document.getElementById('Loading')?.remove();
// const showLoading = computed(() => commonStore.showLoading);
const active = ref<string>('3')
const userDropDownOptions:Array<{[prop:string]:string}> = [
  {
    label: '退出登录',
    key: 'logout',
    // icon: renderIcon(LogoutIcon)
  }
]

const userDropSelect = (key: string | number) => {
  if (key == 'logout') {
    router.push({ name: 'Login' })
    local.removeItem('token')
  }
  
}
const headlist = [
  {
    name: '安全防范',
    key: '1'
  },
  {
    name: '监管执法',
    key: '2'
  },
  {
    name: '监测预警',
    key: '3'
  },
  {
    name: '联合指挥',
    key: '4'
  }
]
function changeActive(item:any) {
}
// const userName = computed(()=>commonStore.token?.userName)

const getUserName = ()=>local.token?.userName??'-'
</script>

<style lang="scss">
.n-spin-content {
  opacity: 1 !important;
}
.n-scrollbar-rail__scrollbar {
  z-index: 999;
}

.active{
  background: #0151DA;
  color: #fff;
  text-align: center;
  padding: 6px 12px;
  border-radius: 8px;
}

.screenRoot {
  overflow: hidden;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 5px;
  scrollbar-arrow-color: red;
}

::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px #aaa;
  background: #aaa;
  scrollbar-arrow-color: red;
}

::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  border-radius: 0;
  background: rgba(0, 0, 0, 0);
}
</style>
