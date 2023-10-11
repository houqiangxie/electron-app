/*
 * @Descripttion:
 * @version:
 * @Author: houqiangxie
 * @Date: 2022-03-10 12:24:17
 * @LastEditors: houqiangxie
 * @LastEditTime: 2023-10-10 19:48:42
 */
import 'virtual:windi.css';
// import * as echarts from 'echarts';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/router';
import emitter from '@/utils/emitter';
import App from './App.vue';
import 'ux-fileviewer/dist/main.css'
const app = createApp(App);
app.config.globalProperties.$emitter = emitter;
app.use(router).use(createPinia()).mount('#app');
