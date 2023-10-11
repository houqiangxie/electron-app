/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-23 10:20:59
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-06-17 09:56:03
 */
export default class Socket {
  private websocket: any;
  private isConnect: boolean;
  private timer: any;
  private isActivelyClose: boolean;
  private param: any;
  constructor(param: any = {}) {
    this.websocket = null;
    this.isConnect = false; //是否连接
    this.timer = null;
    this.isActivelyClose = false; //手动关闭
    this.param = param; // 参数
  }
  connect() {
    if (typeof WebSocket === "undefined") {
      alert("您的浏览器不支持socket");
    } else {
      this.websocket = new WebSocket(`${this.param.url}`);

      this.init(this.param);
    }
  }
  init(param:any) {
    this.isActivelyClose = false;
    this.websocket.onclose = (e:any) => {
      // console.log('关闭' + param.url)
      this.isConnect = false;
      // 如果手动关闭则不进行重连
      if (!this.isActivelyClose) {
        this.resetSocket(param);
      }
    };
    this.websocket.onerror = (e: any) => {
      // console.log('异常' + param.url + e)
      this.resetSocket(param);
    };
    this.websocket.onopen = (e:any) => {
      // console.log('已连接' + param.url)
      this.isConnect = true;
      if (param.data) {
        this.send(param.data || "");
      }
    };
    this.websocket.onmessage = (e:any) => {
      try {
        param.callback(JSON.parse(e.data));
      } catch {
        // console.log(e,param.url);
      }
    };
  }
  resetSocket(param:any) {
    if (this.isConnect === true) {
      return false;
    }
    // console.log('websocket 重新连接~ ', param.url)
    this.isConnect = true;
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.connect();
      this.isConnect = false;
    }, 1000);
  }
  send(data:any) {
    this.websocket.send(JSON.stringify(data));
  }

  close() {
    this.isActivelyClose = true;
    if (this.websocket) {
      this.websocket.close();
    }
  }
}

// ========================================
// function Socket(){
//     let param =  {
//         url: '/socket/lhzh/websocket',
//         callback: (data)=>{},
//     }
//     let testSocket = new Socket(param)
//     testSocket.connect() // 连接
//     testSocket.send(param.data) // 发送消息
//     testSocket.close() // 关闭
// }