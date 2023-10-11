import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv, UserConfigExport, ConfigEnv, externalizeDepsPlugin } from 'electron-vite';
import { fileURLToPath, URL } from "node:url";
import { resolve, join } from "path";
import Components from 'unplugin-vue-components/vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import viteCompression from 'vite-plugin-compression';
import {NaiveUiResolver,} from "unplugin-vue-components/resolvers";
import AutoImport from 'unplugin-auto-import/vite';
import WindiCSS from 'vite-plugin-windicss';
import Pages from 'vite-plugin-pages'
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";
// export default defineConfig({
//   main: {
//     plugins: [externalizeDepsPlugin()]
//   },
//   preload: {
//     plugins: [externalizeDepsPlugin()]
//   },
//   renderer: {
//     resolve: {
//       alias: {
//         '@renderer': resolve('src/renderer/src')
//       }
//     },
//     plugins: [vue()]
//   }
// })

export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  // 环境变量
  const env = loadEnv(mode, process.cwd());
  // 开发环境判断
  const isDev = mode === 'dev';
  // vite插件
  const plugins = [
  // 多页面history模式路由中间件
    {
      name: 'rewrite-middleware',
      configureServer(serve) {
        serve.middlewares.use((req, res, next) => {
        for (const appName in serve.config.build.rollupOptions.input) {
          if (req.url.startsWith(`/${appName}/`)) {
            req.url = `/${appName}/`;
            break;
          }
        }
          next()
        })
      }
    },
    {//自定义模块扩展
      name: "vite-custom-block-plugin",
      transform(code, id) {
        if (/vue&type=custom-block/.test(id)) {
          return `export default Comp => {
            Comp.customBlock = ${code}
          }`;
        }
      },
    },
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => /^micro-app/.test(tag),
        },
      },
    }),
    vueJsx(), //jsx
    ReactivityTransform(),
    Pages({
      dirs: [{ dir: "src/views", baseRoute: "/" }],
      importMode: "async",
      moduleId: "~webRoutes",
      extensions: ["vue"],
      extendRoute(route, parent) {
        return {
          ...route,
          meta: { ...(route.meta || {}), auth: false },
        };
      },
    }),
    /**
     *  注入环境变量到html模板中
     *  如在  .env文件中有环境变量  VITE_APP_TITLE=admin
     *  则在 html模板中  可以这样获取  <%- VITE_APP_TITLE %>
     *  文档：  https://github.com/anncwb/vite-plugin-html
     */
    // createHtmlPlugin({
    //   inject: {
    //     data: {
    //       env: env,
    //     },
    //   },
    //   minify: true,
    // }),
    // elementUi组件自动引入
    Components({
      resolvers: [NaiveUiResolver()],
      dts: "src/renderer/src/components.d.ts",
      dirs: ['src/renderer/src/components'],
    }),
    // 自动引入
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      resolvers: [NaiveUiResolver()],
      // 可以选择auto-import.d.ts生成的位置，使用ts建议设置为'src/auto-import.d.ts'
      dts: "src/renderer/src/auto-import.d.ts",
      dirs: ['src/renderer/src/components'],
    }),
    WindiCSS(),
    /**
     *  把src/icons 下的所有svg 自动加载到body下，供组件使用
     *  类似于webpack中的svg-sprite-loader
     *  文档：https://github.com/anncwb/vite-plugin-svg-icons
     */
    // viteSvgIcons({
    //   // 指定需要缓存的图标文件夹
    //   iconDirs: [resolve(process.cwd(), 'src/icons')],
    //   // 指定symbolId格式
    //   symbolId: 'icon-[name]'
    // })
    externalizeDepsPlugin()
  ];

  // if (!isDev) {
  //   plugins.push(
  //     // gzip插件，打包压缩代码成gzip  文档： https://github.com/anncwb/vite-plugin-compression
  //     viteCompression(),
  //   );
  // }
  return defineConfig({
    main: {
      plugins,
    },
    preload: {
      plugins
    },
    renderer: {
      resolve: {
        alias: [{
          find: "@",
          replacement: fileURLToPath(new URL("./src/renderer/src", import.meta.url)),
        },]
      },
      plugins,
      server: {
        proxy: {
          '/gateway': {
            target: 'http://172.17.30.184:8899',
            changeOrigin: true,
            rewrite: p => p.replace(/^\/gateway/, ''),
          },
        },
      },
    },
    
  });
};
