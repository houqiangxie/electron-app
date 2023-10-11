/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-23 10:20:59
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-05-31 17:08:12
 */
import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  attributify: true,
  safelist: [
    range(10).map((i) => `row-span-${i} col-span-${i}  grid-cols-${i}`), //row-span-1-10  col-span-1-10
  ],
  theme: {
    extend: {
      colors: {
        // 主色
        primary: "#1c90dc",
        // 选中主色
        "primary-active": "#31b4f5",
        // 背景色
        background: "#020b26",
      },
    },
  },
});

function range(size, startAt = 1) {
  return Array.from(Array(size).keys()).map((i) => i + startAt);
}