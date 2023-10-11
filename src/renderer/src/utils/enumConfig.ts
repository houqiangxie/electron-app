/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-06-09 15:20:26
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-06-16 16:34:47
 */

interface SelectType{
    label: string;
    value: string|number;
}

// 按钮类型枚举
enum BtnType { 'default' = 'default', 'primary' = 'primary', 'info' = 'info', 'warning' = 'warning', 'error' = 'error' }

// 是否统发
const isUnifyEnum: SelectType []= [
  { label: "是", value: 1 },
  { label: "否", value: 0 },
];

// 机构状态
const mechanismStatusEnum: SelectType[] = [
  { label: "正常", value: "正常" },
  { label: "未生效", value: "未生效" },
  { label: "已撤销", value: "已撤销" },
];
// 单位性质
const mechanismNatureEnum: SelectType[] = [
  { label: "行政机关", value: "行政机关" },
  { label: "行政执法", value: "行政执法" },
  { label: "参公管理类事业单位", value: "参公管理类事业单位" },
  { label: "事业单位", value: "事业单位" },
];
// 单位属性
const unitPropEnum: SelectType[] = [
  { label: "国家机关", value: "国家机关" },
  { label: "其他", value: "其他" },
];

// 内设机构级别
const insideOrgEnum: SelectType[] = [
    { label: "正局级", value: "正局级" },
    { label: "正处级", value: "正处级" },
    { label: "副处级", value: "副处级" },
    { label: "正科级", value: "正科级" },
    { label: "副科级", value: "副科级" },
]
// 内设机构级别
const insideOrg2Enum: SelectType[] = [
    { label: "正处级", value: "正处级" },
    { label: "副处级", value: "副处级" },
    { label: "正科级", value: "正科级" },
    { label: "副科级", value: "副科级" },
]
// 职务层次
const jobRankEnum: SelectType[] = [
  { label: "正局级", value: "正局级" },
  { label: "副局级", value: "副局级" },
  { label: "正处级", value: "正处级" },
  { label: "副处级", value: "副处级" },
  { label: "正科级", value: "正科级" },
  { label: "副科级", value: "副科级" },
];
// 机关机构类别
const institutionEnum: SelectType[] = [
  { label: "临时机构", value: "临时机构" },
];
// 机关机构类别
const sourceFundingEnum: SelectType[] = [
  { label: "财政核拨", value: "财政核拨" },
  { label: "财政核拨补助", value: "财政核拨补助" },
];
// 机构类别
const mechanismLevelEnum: SelectType[] = [
  { label: "正处级", value: "正处级" },
  { label: "副处级", value: "副处级" },
];
// 机构类别
const internalAgencyTypeEnum: SelectType[] = [
  { label: "内设机构", value: "内设机构" },
  { label: "直属机构", value: "直属机构" },
  { label: "街道应急办", value: "街道应急办" },
];


export {
  BtnType,
  isUnifyEnum,
  mechanismStatusEnum,
  mechanismNatureEnum,
  unitPropEnum,
  insideOrgEnum,
  institutionEnum,
  sourceFundingEnum,
  mechanismLevelEnum,
  internalAgencyTypeEnum,
  insideOrg2Enum,
  jobRankEnum,
};