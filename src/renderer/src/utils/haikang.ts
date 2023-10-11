import emitter from '@/utils/emitter';
import log from 'rd-web-logger';

// 布局
const MULTI_SCREEN_LAYOUT = {
  '1': '1x1',
  '2': '1x2',
  '3': '1+2',
  '4': '2x2',
  '6': '1+5',
  '7': '3+4',
  '8': '1+7',
  '9': '3x3',
  '10': '1+9',
  '13': '4+9',
  '14': '1+1+12',
  '16': '4x4',
  '17': '1+16',
  '24': '4x6',
  '25': '5x5',
};

const screenLayoutSet = [
  '1x1',
  '2x2',
  '3x3',
  '4x4',
  '5x5',
  '1x2',
  '1+2',
  '1+5',
  '1+7',
  '1+8',
  '1+9',
  '1+12',
  '1+16',
  '4+9',
  '1+1+12',
  '3+4',
  '1x4',
  '4x6',
];

export default class HaiKangVideo {
  pubKey: string; // 公钥
  oWebControl: any; // WebControl 实例
  onlineData: Array<any>; // 视频在线状态
  isInit: boolean; // 是否初始化成功
  hasRender: boolean; // 是否实例化成功
  playId: string; // WebControl 实例挂载元素节点
  showCtrBar: boolean; // 底部控制栏显示
  layout: string; // 布局模式
  wndList: Array<any>; // 播放窗口列表
  width: number; // 默认播放视口宽度
  height: number; // 默认播放视口高度
  rePreviewCount: number; // 最大预览重试次数
  isFullScreen: boolean; // 是否全屏状态
  buttonIDs: string; // 内嵌工具条
  rePreviewTimer: any; // 预览重试计时器
  currentWndId: number; // 当前选中窗口序号
  isDestructible: boolean; // 播放器可被销毁

  // 声明公用变量
  constructor(arg?: any) {
    this.pubKey = '';
    this.oWebControl = null;
    this.onlineData = [];
    this.isInit = true;
    this.hasRender = false;
    this.playId = arg.playId || 'playGnd';
    this.showCtrBar = false;
    this.layout = '1x1';
    this.wndList = [];
    this.width = 600;
    this.height = 370;
    this.rePreviewCount = 10;
    this.isFullScreen = false;
    this.buttonIDs = arg.buttonIDs || '';
    this.rePreviewTimer = null;
    this.currentWndId = -1;
    this.isDestructible = true;
  }

  // 创建播放实例
  initPlugin(width = 600, height = 370, params: any) {
    this.width = width;
    this.height = height;

    this.layout = params.layout || '1x1';
    this.isDestructible = !!params.isDestructible;

    this.oWebControl = new window.WebControl({
      szPluginContainer: this.playId, // 指定容器id
      iServicePortStart: 15900, // 指定起止端口号，建议使用该值
      iServicePortEnd: 15909,
      szClassId: '23BF3B0A-2C56-4D97-9C03-0CB103AA8F11', // 用于IE10使用ActiveX的clsid
      cbConnectSuccess: () => {
        log.info('HaiKangVideo ~ initPlugin ~ cbConnectSuccess');

        this.isInit = true; // 创建WebControl实例成功
        this.oWebControl
          .JS_StartService('window', {
            // WebControl实例创建成功后需要启动服务
            dllPath: './VideoPluginConnect.dll', // 值"./VideoPluginConnect.dll"写死
          })
          .then(
            () => {
              // 启动插件服务成功
              this.oWebControl.JS_SetWindowControlCallback({
                cbIntegrationCallBack: (oData: any) => {
                  log.info('HaiKangVideo ~ initPlugin ~ 海康插件服务推送消息：', JSON.stringify(oData.responseMsg));
                  switch (oData.responseMsg.type) {
                    // 窗口选中消息
                    case 1: {
                      // this.currentWndId = oData.responseMsg.msg.wndId;
                      break;
                    }
                    // 预览/回放播放消息
                    case 2: {
                      // 关闭播放
                      if (oData.responseMsg.msg.result === 816) {
                        if (this.isDestructible) {
                          this.delVideo();
                          emitter.emit(`closeHaikangVideo-${this.playId}`, this.playId);
                        }
                      }
                      break;
                    }
                    // 进入/退出全屏
                    case 5: {
                      this.isFullScreen = oData.responseMsg.msg.result === 1024;
                      if (this.isFullScreen) {
                        emitter.emit('showHaikangWnd', false);
                      } else {
                        emitter.emit('showHaikangWnd', true);
                      }
                      break;
                    }
                    // 双击事件
                    case 7: {
                      if (this.isFullScreen) {
                        this.fullScreenCancel();
                      } else {
                        this.fullScreen();
                      }
                      break;
                    }
                  }
                }, // 设置消息回调
              });

              this.create(this.playId, this.width, this.height);
            },
            () => {
              log.info('HaiKangVideo ~ initPlugin ~ 启动海康插件服务失败'); // 启动插件服务失败
            },
          );
      },
      cbConnectError: () => {
        log.info('HaiKangVideo ~ initPlugin ~ 创建WebControl实例失败!请确认是否安装windows桌面依赖环境!'); // 启动插件服务失败
        this.isInit = false;
        // this.close();
      },
      cbConnectClose: (bNormalClose: any) => {
        log.info('HaiKangVideo ~ initPlugin ~ 海康插件服务异常断开!'); // 异常断开
      },
    });
  }

  // 初始化
  init() {
    this.getPubKey(() => {
      // var layout = layout; // playMode指定模式的布局
      var appkey = '22511893'; // 综合安防管理平台提供的appkey，必填
      var secret = this.setEncrypt('8O9hoYAokziME8bU2JId'); // 综合安防管理平台提供的secret，必填
      var ip = '113.98.245.183'; // 综合安防管理平台IP地址，必填
      var playMode = 0; // 初始播放模式：0-预览，1-回放
      var port = 10443; // 综合安防管理平台端口，若启用HTTPS协议，默认443
      var snapDir = 'D:\\SnapDir'; // 抓图存储路径
      var videoDir = 'D:\\VideoDir'; // 紧急录像或录像剪辑存储路径
      var enableHTTPS = 1; // 是否启用 HTTPS 协议与综合安防管理平台交互，这里总是填1
      var encryptedFields = 'secret'; // 加密字段，默认加密领域为secret
      var showToolbar = Number(!!this.showCtrBar); // 是否显示工具栏，0-不显示，非0-显示
      var showSmart = 1; // 是否显示智能信息（如配置移动侦测后画面上的线框），0-不显示，非0-显示
      // var buttonIDs = '0,258,259,260,512,513,514,515,516,517,768,769'; // 自定义工具条按钮
      var toolBarButtonIDs = '4608,4099,4098'; // 自定义底部工具栏按钮

      this.oWebControl
        .JS_RequestInterface({
          funcName: 'init',
          argument: JSON.stringify({
            appkey: appkey,
            secret: secret,
            ip: ip,
            playMode: playMode,
            port: port,
            snapDir: snapDir,
            videoDir: videoDir,
            enableHTTPS: enableHTTPS,
            encryptedFields: encryptedFields,
            showToolbar: showToolbar,
            showSmart: showSmart,
            layout: this.layout,
            buttonIDs: this.buttonIDs,
            toolBarButtonIDs: toolBarButtonIDs,
          }),
        })
        .then((res: any) => {
          this.hasRender = true; // 初始化成功
          this.resize(); // 初始化后resize一次，规避firefox下首次显示窗口后插件窗口未与DIV窗口重合问题
          var myEvent = new Event('resize');
          window.dispatchEvent(myEvent);
        });
    });
  }

  // 获取公钥
  async getPubKey(callback: Function) {
    const oData = await this.oWebControl.JS_RequestInterface({
      funcName: 'getRSAPubKey',
      argument: JSON.stringify({
        keyLength: 1024,
      }),
    });

    log.info('HaiKangVideo ~ getPubKey ~ 海康插件服务-获取公钥', oData);
    if (oData.responseMsg.data) {
      this.pubKey = oData.responseMsg.data;
      callback();
    }
  }

  //RSA加密
  setEncrypt(value: string) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(this.pubKey);
    return encrypt.encrypt(value);
  }

  // 关闭弹窗
  close(callback: any) {
    callback && callback();
    // this.$emit("close");
  }

  // 创建窗体
  async create(id: string, width: number, height: number) {
    this.oWebControl?.JS_CreateWnd(id, width, height).then(() => {
      this.init(); // 创建窗体后初始化
    });
  }

  // 重置窗体大小
  resize() {
    this.oWebControl?.JS_Resize(this.width, this.height - (this.showCtrBar ? 50 : 0));
  }

  // 显示窗体
  show() {
    try {
      this.oWebControl?.JS_ShowWnd();
    } catch (err) {
      log.warn('HaiKangVideo ~ getPubKey ~ 海康插件服务-显示窗体', err);
    }
  }

  // 隐藏窗体
  hide() {
    try {
      this.oWebControl?.JS_HideWnd();
    } catch (err) {
      log.warn('HaiKangVideo ~ getPubKey ~ 海康插件服务-隐藏窗体', err);
    }
  }

  /**
   * 窗体显示隐藏
   * @param {Boolean} show 显示、隐藏
   * @param {Array||}
   */
  showWnd(show: boolean) {}

  /**
   * 全屏
   */
  fullScreen() {
    this.oWebControl?.JS_RequestInterface({
      funcName: 'setFullScreen',
    });
    emitter.emit('showHaikangWnd', false);
  }

  /**
   * 取消全屏
   */
  fullScreenCancel() {
    this.oWebControl?.JS_RequestInterface({
      funcName: 'exitFullScreen',
    });
    emitter.emit('showHaikangWnd', true);
  }

  /**
   * 设置画布
   */
  setLayout(layout: string) {
    if (screenLayoutSet.includes(layout)) {
      this.oWebControl?.JS_RequestInterface({
        funcName: 'setLayout',
        argument: {
          layout, // 窗口布局
        },
      });
    } else {
      log.warn('HaiKangVideo ~ setLayer ~ layout ~ 该布局方式不支持：', layout);
    }
  }

  // 销毁实例
  delVideo() {
    this.oWebControl?.JS_HideWnd(); // 先让窗口隐藏，规避插件窗口滞后于浏览器消失问题
    this.oWebControl?.JS_Disconnect();
  }

  // 预览
  async preview(cameraIndexCode: string, wndId = this.currentWndId, count = 0) {
    // this.clearRePreviewTimer();

    var streamMode = 0; // 主子码流标识：0-主码流，1-子码流
    var transMode = 1; // 传输协议：0-UDP，1-TCP
    var gpuMode = 0; // 是否启用GPU硬解，0-不启用，1-启用
    // var wndId = -1; // 播放窗口序号（在2x2以上布局下可指定播放窗口）
    if (this.oWebControl && this.hasRender) {
      const res = await this.oWebControl.JS_RequestInterface({
        funcName: 'startPreview',
        argument: JSON.stringify({
          cameraIndexCode: cameraIndexCode, // 监控点编号
          streamMode: streamMode, // 主子码流标识
          transMode: transMode, // 传输协议
          gpuMode: gpuMode, // 是否开启GPU硬解
          wndId: wndId, // 可指定播放窗口
        }),
      });

      log.info('HaiKangVideo ~ preview ~ 海康插件服务-预览', res);
    } else if (count < this.rePreviewCount) {
      // 预览重试
      this.rePreviewTimer = setTimeout(() => {
        this.preview(cameraIndexCode, wndId, count + 1);
      }, 3000);
    } else {
      // 超出预览重试次数
    }
  }

  // 清除预览重试计时器
  clearRePreviewTimer() {
    if (this.rePreviewTimer) {
      clearTimeout(this.rePreviewTimer);
      this.rePreviewTimer = null;
    }
  }
}

// 单例模式导出
// const haikangVideo = new HaiKangVideo();
// haikangVideo.initPlugin();

// export default haikangVideo;
