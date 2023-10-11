/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-23 10:20:59
 * @LastEditors: houqiangxie
 * @LastEditTime: 2023-06-20 10:31:07
 */
/**
 * Cfetch
 * 基于原生fetch封装了拦截器功能，暴露出来的Cfetch跟原生fetch用法一致，只是增加了拦截器功能。拦截器用法参考axios的拦截器用法。
 * 拦截器: interceptors
 */

// 定义用来存储拦截请求和拦截响应结果的处理和错误结果处理的函数集合
let interceptorsReq:any[] = [];
let interceptorsReqError: any[] = [];
let interceptorsRes: any[] = [];
let interceptorsResError: any[] = [];

// 复制一份原生fetch的方法，后面我们还是得调用原生的fetch，只是我们在fetch之上做一层封装，添加我们想要的功能
const OriginFetch = window.fetch;

export async function Cfetch(input:any, init:any = {}) {
  // interceptorsReq是拦截请求的拦截处理函数集合
  init.url = input;
  for (const [key,item] of Object.entries(interceptorsReq)) {
    init =await item(init);
  }
  // interceptorsReq.forEach(async (item) => {
  //   init =await item(init);
  //   console.log('init: ', init);
  // }); 

  // 在原生fetch外面封装一个promise，为了在promise里面可以对fetch请求的结果做拦截处理。
  // 同时，保证Cfetch函数返回的结果是个promise对象。
  return new Promise((resolve, reject) => {
    // 读取缓存数据，直接返回
    if (init.cached && init.res) {
      let res
      interceptorsResError.forEach((item) => {
        // 拦截器对响应结果做处理，把处理后的结果返回给响应结果。
        res = item({error:init}); // 保留config
      });
        // 将拦截器处理后的响应结果resolve出去
      console.log(init,'缓存数据')
      return resolve(res);
    }

    // 发起fetch请求，fetch请求的形参是接收上层函数的形参
    OriginFetch(input, init)
      .then((res) => {
        // interceptorsRes是拦截响应结果的拦截处理函数集合
        interceptorsRes.forEach((item) => {
          // 拦截器对响应结果做处理，把处理后的结果返回给响应结果。
          res = item(Object.assign(res, { requestConfig: init })); // 保留config
        });
        // 将拦截器处理后的响应结果resolve出去
        resolve(res);
      })
      .catch((err) => {
        // interceptorsResError是拦截响应错误结果的拦截处理函数集合
        interceptorsResError.forEach((item) => {
          // 拦截器对响应错误结果做处理，把处理后的结果返回给响应结果。
          err = item({error:err, requestConfig: init });
        });
        reject(err);
      });
  });
}

// interceptors拦截器提供request和response两种拦截器功能。
// 可以通过request和response的use方法来绑定两种拦截器的处理函数。
// use方法接收两个参数，参数为一个callback函数，callback函数用来作为拦截器的成功处理函数，errorCallback作为错误处理函数
// request.use方法会把callback放在interceptorsReq中，等待执行。
// response.use方法会把callback放在interceptorsRes中，等待执行。
// 拦截器的处理函数callback接收一个参数。
// request拦截器的callback接收的是请求发起前的config；
// response拦截器的callback接收的是网络请求的response结果。
export const interceptors = {
  request: {
    use(callback: Function, errorCallback?: Function) {
      interceptorsReq.push(callback);
      errorCallback && interceptorsReqError.push(errorCallback);
    },
  },
  response: {
    use(callback: Function, errorCallback?: Function) {
      interceptorsRes.push(callback);
      errorCallback && interceptorsResError.push(errorCallback);
    },
  },
};

// // 暴露导出这个对象
// export default {
//     Cfetch,
//     interceptors
// }
