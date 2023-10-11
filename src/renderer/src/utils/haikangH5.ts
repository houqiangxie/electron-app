export const errorCode:{[prop:string]:string} = {
  "0x12f900001":	"接口调用参数错误",
  "0x12f900002":	"不在播放状态",
  "0x12f900003":	"仅回放支持该功能",
  "0x12f900004":	"普通模式不支持该功能",
  "0x12f900005":	"高级模式不支持该功能",
  "0x12f900006":	"高级模式的解码库加载失败",
  "0x12f900008":	"url格式错误",
  "0x12f900009":	"取流超时错误",
  "0x12f900010":	"设置或者是获取音量失败，因为没有开启音频的窗口",
  "0x12f900011":	"设置的音量不在1-100范围",
  "0x12f910000":	"websocket连接失败，请检查网络是否通畅，URL是否正确",
  "0x12f910010":	"取流失败",
  "0x12f910011":	"流中断，电脑配置过低，程序卡主线程都可能导致流中断",
  "0x12f910014":	"没有音频数据",
  "0x12f910015":	"未找到对应websocket，取流套接字被动关闭的报错",
  "0x12f910016":	"websocket不在连接状态",
  "0x12f910017":	"不支持智能信息展示",
  "0x12f910018":	"websocket长时间未收到message",
  "0x12f910019":	"wss连接失败，原因：端口尚未开通、证书未安装、证书不安全",
  "0x12f910020":	"单帧回放时不能暂停",
  "0x12f910021":	"已是最大倍速",
  "0x12f910022":	"已是最小倍速",
  "0x12f910023":	"ws/wss连接超时，默认6s超时时间，原因：网络异常，网络不通",
  "0x12f910026":	"jsdecoder1.0解码报错视频编码格式不支持",
  "0x12f910027":	"后端取流超时，主动关闭连接（设备突然离线或重启，网络传输超时20s）",
  "0x12f910028":	"设置的缓冲区大小无效，大小0-510241024，不在该范围的报错",
  "0x12f910029":	"普通模式的报错，码流异常导致黑屏,尝试重新取流",
  "0x12f910031":	"普通模式下播放卡主会出现",
  "0x12f910032":	"码流编码格式普通模式下不支持，可切换高级模式尝试播放",
  "0x12f920015":	"未调用停止录像，再次调用开始录像",
  "0x12f920016":	"未开启录像调用停止录像接口错误",
  "0x12f920017":	"紧急录像目标格式不支持，非ps/mp4",
  "0x12f920018":	"紧急录像文件名为null",
  "0x12f930010":	"内存不足",
  "0x12f930011":	"首帧显示之前无法抓图，请稍后重试",
  "0x12f950000":	"采集音频失败，可能是在非https域下使用对讲导致",
  "0x12f950001":	"对讲不支持这种音频编码格式"
}
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

import emitter from '@/utils/emitter';

const MSE_IS_SUPPORT = !!window.MediaSource // 是否支持mse
export default class HaikangH5 {
  player: any; // WebControl 实例
  playId: string; // WebControl 实例挂载元素节点
  showCtrBar: boolean; // 底部控制栏显示
  layout: string; // 布局模式
  width: number; // 默认播放视口宽度
  height: number; // 默认播放视口高度
  rePreviewCount: number; // 最大预览重试次数
  isFullScreen: boolean; // 是否全屏状态
  buttonIDs: string; // 内嵌工具条
  urls: any; // 视频、音频等链接
  mseSupport: boolean; //是否支持mse
  tabActive: string;
  mode: number;
  timer: any;
  playback: any; // 回放信息
  btnStatus: any; // 按钮状态
  splitNum: any;
  muted:boolean;

  // 声明公用变量
  constructor(arg?: any) {
    this.player = null;
    this.playId = arg.playId || "playGnd";
    this.showCtrBar = false;
    this.layout = "1x1";
    this.width = 600;
    this.height = 370;
    this.rePreviewCount = 10;
    this.isFullScreen = false;
    this.buttonIDs = arg.buttonIDs || "";
    this.urls = { realplay: arg.realplay };
    this.mseSupport = MSE_IS_SUPPORT;
    this.tabActive = MSE_IS_SUPPORT ? "mse" : "decoder"; //高级模式 单帧/电子放大&智能信息
    this.mode = 0;
    this.timer = null;
    this.playback = {};
    this.btnStatus = {};
    this.muted = false;
  }

  // 创建播放实例

  init() {
    // 设置播放容器的宽高并监听窗口大小变化
    this.mode = this.tabActive === "mse" ? 0 : 1;
    window.addEventListener("resize", () => {
      this.player.JS_Resize();
    });
    this.createPlayer();
  }
  createPlayer() {
    this.player = new window.JSPlugin({
      szId: this.playId,
      szBasePath: "/video",
      // iMaxSplit: 4,
      // iCurrentSplit: IS_MOVE_DEVICE ? 1 : 2,
      // openDebug: true,
      // oStyle: {
      //   borderSelect: IS_MOVE_DEVICE ? '#000' : '#FFCC00',
      // }
    });

    // 事件回调绑定
    //   this.player.JS_SetWindowControlCallback({
    //     windowEventSelect: function (iWndIndex) {  //插件选中窗口回调
    //         console.log('windowSelect callback: ', iWndIndex);
    //     },
    //     pluginErrorHandler: function (iWndIndex, iErrorCode, oError) {  //插件错误回调
    //         console.log('pluginError callback: ', iWndIndex, iErrorCode, oError);
    //     },
    //     windowEventOver: function (iWndIndex) {  //鼠标移过回调
    //         //console.log(iWndIndex);
    //     },
    //     windowEventOut: function (iWndIndex) {  //鼠标移出回调
    //         //console.log(iWndIndex);
    //     },
    //     windowEventUp: function (iWndIndex) {  //鼠标mouseup事件回调
    //         //console.log(iWndIndex);
    //     },
    //     windowFullCcreenChange: function (bFull) {  //全屏切换回调
    //         console.log('fullScreen callback: ', bFull);
    //     },
    //     firstFrameDisplay: function (iWndIndex, iWidth, iHeight) {  //首帧显示回调
    //         console.log('firstFrame loaded callback: ', iWndIndex, iWidth, iHeight);
    //     },
    //     performanceLack: function () {  //性能不足回调
    //         console.log('performanceLack callback: ');
    //     }
    // });
  }
  arrangeWindow() {
    let splitNum = this.splitNum;
    this.player.JS_ArrangeWindow(splitNum).then(
      () => {
        console.log(`arrangeWindow to ${splitNum}x${splitNum} success`);
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  wholeFullScreen() {
    this.player.JS_FullScreenDisplay(false).then(
      () => {
        console.log(`wholeFullScreen success`);
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  /* 预览&对讲 */
  realplay(url?: string, type?: string, callBack?: Function) {
    let { player, mode, urls } = this,
      index = player.currentWindowIndex,
      playURL = url || urls.realplay;
    if (!type) type = "player";
    player.JS_Play(playURL, { playURL, mode }, index).then(
      () => {
        this.btnStatus[type as string] = true;
        callBack?.(true);
        console.log("realplay success");
      },
      (e) => {
        callBack?.(false);
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  stopPlay(type?: string) {
    if (!type) type = "player";
    this.player.JS_Stop().then(
      () => {
        this.playback.rate = 0;
        this.btnStatus[type as string] = false;
        console.log("stop realplay success");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  talkStart(url?: string) {
    if (!url) url = this.urls.talk;
    this.player.JS_StartTalk(url).then(
      () => {
        this.btnStatus["talk"] = true;
        console.log("talkStart success");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  talkStop() {
    this.player.JS_StopTalk().then(
      () => {
        this.btnStatus["talk"] = false;
        console.log("talkStop success");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  stopAllPlay() {
    this.player.JS_StopRealPlayAll().then(
      () => {
        this.playback.rate = 0;
        console.log("stopAllPlay success");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  /* 回放 */
  playbackStart() {
    let { player, mode, urls, playback } = this,
      index = player.currentWindowIndex,
      playURL = urls.playback,
      { startTime, endTime } = playback;

    startTime += "Z";
    endTime += "Z";

    player.JS_Play(playURL, { playURL, mode }, index, startTime, endTime).then(
      () => {
        console.log("playbackStart success");
        this.playback.rate = 1;
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  playbackPause() {
    this.player.JS_Pause().then(
      () => {
        console.log("playbackPause success");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  playbackResume() {
    this.player.JS_Resume().then(
      () => {
        console.log("playbackResume success");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  seekTo() {
    let { seekStart, endTime } = this.playback;
    seekStart += "Z";
    endTime += "Z";
    this.player
      .JS_Seek(this.player.currentWindowIndex, seekStart, endTime)
      .then(
        () => {
          console.log("seekTo success");
        },
        (e) => {
          window.$message.error(errorCode[e] || e);
        }
      );
  }
  playbackSlow() {
    this.player.JS_Slow().then(
      (rate) => {
        this.playback.rate = rate;
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  playbackFast() {
    this.player.JS_Fast().then(
      (rate) => {
        this.playback.rate = rate;
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  frameForward() {
    this.player.JS_FrameForward(this.player.currentWindowIndex).then(
      () => {
        this.playback.rate = 1;
        console.log("frameForward success");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  /* 声音、抓图、录像 */
  openSound() {
    this.player.JS_OpenSound().then(
      () => {
        this.btnStatus["sound"] = true;
        console.log("openSound success");
        this.muted = false;
      },
      (e) => {
        this.btnStatus["sound"] = false;
        window.$message.error(errorCode[e] || e);
        console.log(errorCode[e] || e);
      }
    );
  }
  closeSound() {
    this.player.JS_CloseSound().then(
      () => {
        this.btnStatus["sound"] = false;
        console.log("closeSound success");
        this.muted = true;
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  setVolume(value) {
    // 音量
    let player = this.player,
      index = player.currentWindowIndex;
    this.player.JS_SetVolume(index, value).then(
      () => {
        console.log("setVolume success", value);
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  capture(imageType) {
    let player = this.player,
      index = player.currentWindowIndex;

    player.JS_CapturePicture(index, "img", imageType).then(
      () => {
        console.log("capture success", imageType);
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  recordStart(type:any) {
    const codeMap = { MP4: 5, PS: 2 };
    let player = this.player,
      index = player.currentWindowIndex,
      fileName = `${moment().format("YYYYMMDDHHmm")}.mp4`;
    typeCode = codeMap[type];

    player.JS_StartSaveEx(index, fileName, typeCode).then(
      () => {
        console.log("record start ...");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  recordStop() {
    let player = this.player;
    index = player.currentWindowIndex;

    player.JS_StopSave(index).then(
      () => {
        console.log("record stoped, saving ...");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  /* 电子放大、智能信息 */
  enlarge() {
    let player = this.player,
      index = player.currentWindowIndex;

    player.JS_EnableZoom(index).then(
      () => {
        console.log("enlarge start..., select range...");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  enlargeClose() {
    let player = this.player,
      index = player.currentWindowIndex;

    player.JS_DisableZoom(index).then(
      () => {
        console.log("enlargeClose success");
      },
      (e) => {
        window.$message.error(errorCode[e] || e);
      }
    );
  }
  intellectTrigger(openFlag:boolean) {
    let player = this.player,
      index = player.currentWindowIndex;

    let result = player.JS_RenderALLPrivateData(index, openFlag);
    console.log(
      `${openFlag ? "open" : "close"} intellect ${
        result === 1 ? "success" : "failed"
      }`
    );
  }
  getvideoInfo() {
    let player = this.player,
      index = player.currentWindowIndex;

    player.JS_GetVideoInfo(index).then(function (videoInfo:any) {
      console.log("videoInfo:", videoInfo);
    });
  }
  getOSDTime() {
    let player = this.player,
      index = player.currentWindowIndex;

    player.JS_GetOSDTime(index).then(function (time:any) {
      console.log("osdTime:", new Date(time));
    });
  }
}