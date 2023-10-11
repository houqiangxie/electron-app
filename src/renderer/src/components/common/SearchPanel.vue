<!--
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-24 18:46:42
 * @LastEditors: houqiangxie
 * @LastEditTime: 2023-07-19 15:15:05
-->
<template>
    <div class="w-full p-5 search-box bg-white relative rounded-t-lg">
        <n-form label-placement="left" :model="searchModel" ref="searchForm">
            <div :class="`box grid grid-cols-${cols} gap-x-5 gap-y-3`">
                <n-form-item :label="item.label || item.title" v-for="(item, index) in config" :key="index"
                    v-show="showAllSearchField || item.isSearch" v-bind="item.bindItem">
                    <slot v-if="item.bind?.slotName" :name="item.bind.slotName" :row="item"></slot>
                    <RenderComponent v-else-if="item.renderComponent" :data="() => item.renderComponent?.(item, searchModel, searchModel[item.key as string])"></RenderComponent>
                    <component v-else-if="typeof item.key == 'string'" class="w-full"
                        :is="componentList[item.component || 'NInput']"
                        v-model:value="searchModel[item.component == 'NDatePicker' ? (item.key + 'value') : item.key]"
                        v-model:formatted-value="searchModel[item.key]" :options="item.options" :type="item.type"
                        :clearable="true" v-bind="item.bind" v-on="{ ...item.on }"></component>
                    <n-grid v-else x-gap="12" :cols="item.key && item.key.length">
                        <n-form-item-gi v-for="(it, i) in item.key" :key="i">
                            <RenderComponent v-if="item.bind?.[i]?.renderComponent" :data="item.bind?.[i]?.renderComponent"></RenderComponent>
                            <component class="w-full"
                                :is="componentList[item.component && item.component[i] || 'NInput']"
                                :type="item.type && item.type[i] || 'input'"
                                v-model:value="searchModel[item.component == 'NDatePicker' ? (it + 'value') : it]"
                                :clearable="true" :options="item.options?.[i]" v-model:formatted-value="searchModel[it]"
                                v-bind="item.bind?.[i] || {}" v-on="{ ...(item.on?.[i] || {}) }"></component>
                        </n-form-item-gi>
                    </n-grid>
                </n-form-item>
                <n-form-item v-if="showSearchButton" v-bind="bindSearch" class="search-btn">
                    <n-button class="mr-2" type="info" @click="getList"><svg class="icon text-white text-xs mr-1"
                            aria-hidden="true">
                            <use xlink:href="#icon-search"></use>
                        </svg>查询</n-button>
                    <n-button class="mr-2" type="info" ghost @click="resetForm"><svg
                            class="icon text-[#2080f0] text-xs mr-1" aria-hidden="true">
                            <use xlink:href="#icon-reset"></use>
                        </svg>重置</n-button>
                    <slot name="searchSlot"></slot>
                </n-form-item>
                <n-form-item style="margin-left: auto;" v-bind="bindSlot">
                    <slot></slot>
                </n-form-item>
            </div>
        </n-form>
    </div>
</template>

<script  lang="tsx" setup>
const RenderComponent = (props:any) => {
    return h(<>{ props.data() } </>)
}
// 备注：当同一个label需要渲染多个组件，key,component，options,bind，bindItem等属性需要数组形式 bindItem:{showSlot:true,slotName:'name'}会优先渲染动态插槽
interface ConfigItem {
    label?: string, //搜索标签
    title?: string,//搜索标签
    key: string | Array<string>, //绑定model的key
    isSearch?: boolean, //是否渲染该字段
    component?: string, //组件名称 'NInput'
    options?: Array<any> | any, //select,tree等下拉list
    type?: string, //日期组件或textarea等组件type
    bind?: Record<string, any>,//bind到动态组件的属性，需要什么属性参考组件文档
    on?: Record<string, any>,//bind到动态组件的事件，需要什么属性参考组件文档
    slot?: Record<string, any>,//动态组件slot插槽
    bindItem?: Record<string, any> //bind到formItem的属性（class等） 
    renderComponent?: ((item: any, formData: any, curData: any) => any) //自定義render函數渲染組件 
}

//组件使用方法
// const configItem:ConfigItem = {
//     title: '文字',
//     key: 'key',
//     required: false,
//     notValidate: false,
//     hidden: false,
//     component: 'NInput',
//     options: [{label:'33',value:'33'}], //select,tree等下拉list
//     type: 'input', //日期组件或textarea等组件type
//     on: {'updateValue':()=>{}},//bind到动态组件的事件，需要什么属性参考组件文档
//     bind: {disabled:true,pattern:/^.+$/,},//bind到动态组件的属性，需要什么属性参考组件文档  pattern表单校验正则，patternType默认校验的正则（validateReg）fileType自定义文件校验类型
//     slot: {default:(item: any, formModel: any, curData: any)=>(<div>3333</div>)},//动态组件slot插槽  插槽内容可以为string,html tsx
//     bindItem: {class:'col-span-2'} //bind到formItem的属性（class等） 
//     renderComponent: ((item: any, formModel: any, curData: any) => any) //自定義render函數渲染組件 内容可以为string,html tsx
// }

const { config = [], showAllSearchField = false, searchModel = {}, showSearchButton = true, cols = 7, bindSearch = {}, bindSlot = {} } = defineProps<{
    config: Array<ConfigItem>
    showAllSearchField?: boolean, //是否显示所有字段
    searchModel: any, //双向bind
    showSearchButton?: boolean, //是否显示搜索清空按钮
    cols?: number //grid分多少列
    bindSearch?: Record<string, any> //搜索按钮列bind属性
    bindSlot?: Record<string, any>//扩展插槽按钮列bind属性
}>()
const emit = defineEmits<{
    (e: 'search', payload: any): void;
    (e: 'resetForm'): void;
}>()

const componentList: any = {
    NInput,
    NSelect,
    NDatePicker,
    NCascader,
    NTreeSelect,
}
const searchForm = ref()

const resetForm = () => {
    config.forEach(s => {
        if (typeof s.key == 'string') searchModel[s.key as string] = null;
        else {
            for (const k in s.key) {
                searchModel[s.key[k] as string] = null;
            }
        }
    })
    emit('resetForm');
    searchModel.pageNum = 1
    getList()
}

const getList = () => {
    emit('search', searchModel)
}

watch(searchModel, () => {
    if (!showSearchButton) getList()
})

</script>

<style scoped>.search-box :deep(.n-form-item-feedback-wrapper) {
    display: none !important;
}</style>