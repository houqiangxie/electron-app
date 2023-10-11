/*
 * @Descripttion:
 * @version:
 * @Author: houqiangxie
 * @Date: 2022-03-10 12:32:38
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-06-17 09:46:23
 */
import { defineStore } from 'pinia';

export const useCommonStore = defineStore('common', () => {
  const showLoading = ref<boolean>(false); //接口loading
  const isIframe = ref<boolean>(false);
  const token = ref<{[prop:string]:any}>();
  return { showLoading, isIframe, token };
});
