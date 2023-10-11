<!--
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-23 10:20:59
 * @LastEditors: houqiangxie
 * @LastEditTime: 2023-10-11 09:11:08
-->
<template>
  <div class="flex h-full pt-[60px]">
    <router-view class="h-full overflow-auto flex-1 bg-[#f4f4f4]"></router-view>
  </div>
</template>

<route>
  {
    "title": "eeee",
    "redirect":{"name":"Index-Home"}
  }
</route>

<script setup lang="ts">
import { MenuOption,MenuInst  } from 'naive-ui'
// import {RenderSvg}from '@/tsx/svg'
const router = useRouter()
const menuInstRef = ref<MenuInst >()
const selectKey = ref()
const route = useRoute();

// const expandMenuIcon = (option: MenuOption,icon:string)=>{
//   // return h('div',null,h('svg',{class: 'icon text-white','aria-hidden':true},h('use',{'xlink:href':'#icon-sanjiaoxing'},'')))
//   return h(RenderSvg,{icon,className:'text-white'},'')
// }

// const renderIcon= (icon:string)=> {
//   return ()=> h(RenderSvg,{icon,className:'!text-white !text-xs'},'')
// }
// const menuOptions: MenuOption[] = [
//   {
//     label:'系统首页',
//     key: 'Home',
//     icon:renderIcon('shouye'),
//     children:[
//       {
//         label: '系统首页',
//         key: 'HomeIndex',
//       },
//       {
//         label: '个人信息管理',
//         key: 'PersonInfo',
//       },
//     ]
//   },
// ]

// watch(selectKey,(val:string)=>{
//   if(route.name!=val)router.push({name:val})
// })

// onMounted(() => {
//   selectKey.value=route.name
//   menuInstRef.value?.showOption(selectKey.value)
// })


</script>
 