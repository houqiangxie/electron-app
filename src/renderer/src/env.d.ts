/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-06-17 09:23:59
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-06-17 09:43:05
 */
/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}


interface Window {
  $message: any;
  $dialog: any;
  JSPlugin: any;
  WebControl: any;
  Cesium: any;
}

declare module "pdfh5";
declare module "particles.vue3";
