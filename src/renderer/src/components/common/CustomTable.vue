<!--
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-25 11:21:28
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-05-25 11:33:09
-->
<template>
<div class="rounded bg-white p-3">
    <n-data-table :columns="columns" :data="data" :pagination="pagination" />
</div>
</template>

<script setup lang="ts">
const {columns,data} = defineProps<{data:any,columns:any}>()
const pagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 30,40,50],
    onChange: (page:number) => {
        pagination.page = page
    },
    onUpdatePageSize: (pageSize:number) => {
        pagination.pageSize = pageSize
        pagination.page = 1
    }
})
</script>