/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-06-05 10:19:12
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-06-13 16:52:07
 */
import {saveAs} from "file-saver";
import {  utils,write,read } from "xlsx"; // 注意处理方法引入方式
/**
 * 
 * @param json json数据Array<object>
 * @param fields 表头 object
 * @param filename 表名 string
 */
const exportXlsx =(json:Array<any>, fields:any, filename:string = ".xlsx") =>{
    const s2ab = (s) => {
        var buf;
        if (typeof ArrayBuffer !== "undefined") {
            buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
            return buf;
        } else {
            buf = new Array(s.length);
            for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff;
            return buf;
        }
    };
  //导出xlsx
  json.forEach((item) => {
        for (let i in item) {
        if (fields.hasOwnProperty(i)) {
            item[fields[i]] = item[i];
        }
        delete item[i]; //删除原先的对象属性
        }
    });
    let sheetName = filename; //excel的文件名称
    let wb = utils.book_new(); //工作簿对象包含一SheetNames数组，以及一个表对象映射表名称到表对象。XLSX.utils.book_new实用函数创建一个新的工作簿对象。
    let ws = utils.json_to_sheet(json, { header: Object.values(fields) }); //将JS对象数组转换为工作表。
    wb.SheetNames.push(sheetName);
    wb.Sheets[sheetName] = ws;
    const defaultCellStyle = {
        font: { name: "Verdana", sz: 13, color: "FF00FF88" },
        fill: { fgColor: { rgb: "FFFFAA00" } },
    }; //设置表格的样式
    let wopts = {
      bookType: "xlsx",
      bookSST: false,
      type: "binary",
      cellStyles: true,
      defaultCellStyle: defaultCellStyle,
      showGridLines: false,
      cellDates: true,
    }; //写入的样式
    let wbout = write(wb, wopts);
    let blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, filename + ".xlsx");
}

/**
 * 
 * @param event Event 事件对象
 * @param callback 回调函数
 * @returns 
 */
const importXlsx = (event: Event,callback=(tb:any)=>{}) => {
    const file = (event.target as any).files[0];
    if (!file.name.match(/(xls|xlsx)$/)) {
      window.$message.error("文件格式不对，请重新选择文件上传");
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = (ev: Event) => {
        try {
            const tableData:any[] = []
            const data = (ev.target as any).result;
            const workbook = read(data, { type: "binary", cellDates: true });
            // 取对应表生成json表格内容
            workbook.SheetNames.forEach((item) => {
            tableData.push(...utils.sheet_to_json(workbook.Sheets[item]));
            });
            callback?.(tableData);
            
        // 重写数据
      } catch (e) {
        console.log("error:" + e);
        return false;
      }
    };
    fileReader.readAsBinaryString(file);
}

/**
 * 
 * @param url 文件url
 * @returns 处理后的url拼接绝对地址后的url
 */
const loadPublicFile = (url: string): string => new URL(import.meta.url.replace(/(.*)\/src.*/, '$1') + url, import.meta.url).href

/**
 * 
 * @param target 源数据 
 * @returns  copyTarget
 */
const deepClone=(target:any):any=> {
  if (target&&typeof target === "object") {
    const result:any = Array.isArray(target) ? [] : {};
    for (const key in target) {
      if (typeof target[key] === "object") {
        result[key] = deepClone(target[key]);
      } else {
        result[key] = target[key];
      }
    }
    return result;
  }
  return target;
}

// 根据key返回配置列
const getConfigCol = (key: string,list:Array<{key:string}>): any => {
  return list.find(listItem=>listItem.key === key)??{}
}

export { exportXlsx, importXlsx, loadPublicFile, deepClone, getConfigCol };

