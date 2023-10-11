/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-30 14:41:02
 * @LastEditors: houqiangxie
 * @LastEditTime: 2023-06-20 10:24:57
 */
import { local } from 'ux-web-storage';
import { useCommonStore } from '@/store/common';
import { Router } from 'vue-router';
export default (router:Router):void => {
    router.beforeEach((to, from, next) => {
        const params = new URLSearchParams(window.location.hash.replace(/(.*)\?(.*)/g, '$2'));
        const commonStore = useCommonStore()
        commonStore.isIframe = params.get('token') || params.get('isIframe') ? true : false;
        const token = local.token?.token;
        if (to.meta.requiresAuth && !token) {
            next(`/login?returnUrl=${encodeURIComponent(to.fullPath)}`);
        } else {
            next();
        }
    });
}