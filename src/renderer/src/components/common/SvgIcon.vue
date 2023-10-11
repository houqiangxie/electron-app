<!--
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-08-11 10:42:00
 * @LastEditors: liulang 364276421@qq.com
 * @LastEditTime: 2023-04-11 09:20:07
-->
<template>
    <svg class="icon" aria-hidden="true">
        <use :xlink:href="symbolId"/>
    </svg>
</template>

<script setup lang="ts">
const {prefix='icon',name,color='#333'} =defineProps<{prefix?:string,name:string,color?:string}>()
const symbolId = computed(() => `#${prefix}-${name}`)
</script>