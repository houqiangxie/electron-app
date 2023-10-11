/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-23 10:20:59
 * @LastEditors: houqiangxie
 * @LastEditTime: 2023-10-10 20:09:15
 */
import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router';
import permission from './permission'
import webRoutes from '~webRoutes'
console.log('webRoutes: ', webRoutes);
const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },
  ...webRoutes,
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "Index-Home-HomeIndex" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
});
permission(router)


export default router;
