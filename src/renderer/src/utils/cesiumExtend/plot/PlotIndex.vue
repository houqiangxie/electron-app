<template>
  <div class="cesium-mask" v-show="(visible && isShoushi) || outerUseMask" @contextmenu.prevent="maskRightClick"></div>
  <div
    v-show="visible"
    class="plot-box top-[150px] rounded-[8px] absolute right-5 p-[16px] pt-0 text-[#20a4f7] bg-[rgba(5,28,63,0.9)] z-10 w-[480px] h-[calc(100%-180px)]"
  >
    <div class="top relative mb-2">
      <span class="title text-[20px]">地图标绘</span>
      <n-icon class="rotate-45 transform cursor-pointer !absolute top-0 right-1" @click="visible = false"> <circle-plus /></n-icon>
    </div>
    <ul class="tabs rounded border-[1px] border-[#20a4f7] p-[4px] text-[14px] overflow-hidden">
      <li
        class="float-left leading-[32px] w-1/2 text-center cursor-pointer"
        :class="{ active: item.id == tabsActive }"
        @click="tabsChange(item)"
        v-for="item in tabsList"
        :key="item.id"
      >
        {{ item.name }}
      </li>
    </ul>
    <div class="content h-[calc(100%-105px)]">
      <template v-if="tabsActive == 0">
        <div class="fileNameBox flex">
          <label class="el-form-item__label" style="width: 80px"><span class="text-[red] mr-1 align-middle">*</span>文件名称</label>
          <n-input v-model="saveData.name" placeholder="请输入名称" size="large" clearable class="fileName" />
        </div>
        <div class="typeBox mb-[-16px]" v-if="visible">
          <div class="title-label">标绘类型</div>
          <n-scrollbar width="100%" class="!h-[96px]">
            <ul>
              <li v-for="item in plotType" :key="item.type" @click="plotClick(item)" :class="{ active: item.label == activeItem.label }">
                <SvgIcon :name="item.icon" />
                <p>{{ item.label }}</p>
              </li>
            </ul>
          </n-scrollbar>
        </div>
        <div class="styleBox" v-show="activeItem.type != 'shoushi'">
          <div class="title-label">样式管理</div>
          <PlotUnits :config="styleManage" :form-data="formData" :showItem="activeItem.showType" />
        </div>

        <div class="blockBox flex-1 overflow-hidden">
          <div class="title-label">图层管理</div>
          <div class="h-[calc(100%-80px)]">
            <n-data-table
              :data="saveData.data"
              style="width: 100%"
              empty-text="无数据"
              height="100%"
              :row-style="({ row, rowIndex }) => (rowIndex % 2 ? { background: '#0F2648' } : { background: 'rgba(15, 38, 72, 0.7)' })"
              :row-class-name="({ row, rowIndex }) => (row.objId == selectId ? 'active' : '')"
            >
              <el-table-column prop="name" label="名称" width="auto">
                <template #default="{ row }">
                  <span
                    style="
                      max-width: calc(100% - 20px);
                      display: inline-block;
                      white-space: nowrap;
                      overflow: hidden;
                      vertical-align: sub;
                      margin-right: 5px;
                      text-overflow: ellipsis;
                      cursor: pointer;
                    "
                    :title="row.name"
                    @click="jumpFn(row)"
                    >{{ row.name }}</span
                  >
                  <el-icon @click="editItem(row)" style="fill: #20a4f7"><edit /></el-icon>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="110">
                <template #default="{ row }">
                  {{ row?.config?.label }}
                </template>
              </el-table-column>
              <el-table-column prop="address" label="操作" class-name="caozuo" width="100">
                <template #default="{ row }">
                  <template v-if="row.config.isSearch">
                    <el-icon title="搜索" style="color: #3279a8" @click="searchItem(row)"><search /></el-icon>
                    <span class="!text-[#3279a8]">|</span>
                  </template>
                  <el-icon title="删除" style="color: #b74d57" @click="deleteSelect(row)"><delete /></el-icon>
                </template>
              </el-table-column>
            </n-data-table>
          </div>
        </div>

        <div class="bottom-btn">
          <el-button type="primary" @click="saveFn" size="large">保存</el-button>
          <el-button type="primary" :icon="Delete" plain @click="clearAllFn" size="large" v-if="!editHistoryState">清空</el-button>
          <el-button type="primary" :icon="Close" plain @click="cancelFn" size="large" v-else>取消</el-button>
        </div>
      </template>
      <template v-else>
        <el-table
          :data="plotDataAll"
          style="width: 100%"
          class="historyList"
          empty-text="无数据"
          height="100%"
          :row-style="({ row, rowIndex }) => (rowIndex % 2 ? { background: '#0F2648' } : { background: 'rgba(15, 38, 72, 0.7)' })"
          :row-class-name="({ row, rowIndex }) => (row.id == saveData.id ? 'active' : '')"
        >
          <el-table-column type="index" width="80" label="序号" />
          <el-table-column prop="name" label="文件名称" width="auto"></el-table-column>
          <el-table-column prop="type" label="标绘数量" width="105">
            <template #default="{ row }">
              {{ row?.data?.length }}
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作" class-name="caozuo" width="110">
            <template #default="{ row }">
              <el-icon title="编辑" style="color: #3279a8" @click="editHistory(row)"><edit /></el-icon>
              <span class="!text-[#3279a8] px-[4px]">|</span>
              <el-icon title="删除" style="color: #b74d57" @click="delHistory(row)"><delete /></el-icon>
            </template>
          </el-table-column>
        </el-table>
        <!-- <ul class="scroll historyList" v-drawScroll>
          <li v-for="item in plotDataAll" :key="item.id" :class="{'active':item.id==saveData.id}">
            <span class="title" :title="item.name">{{item.name}}</span>
            <el-icon title="编辑" style="color:#3279a8" @click="editHistory(item)"><edit /></el-icon>
            <span class="!text-[#3279a8] px-[4px]">|</span>
            <el-icon title="删除" style="color:#b74d57" @click="delHistory(item)"><delete /></el-icon>
          </li>
        </ul> -->
      </template>
    </div>
  </div>

  <n-modal v-model="editVisible" custom-class="editPlot" title="修改" width="500px">
    <PlotUnits :config="editStyleManage" :form-data="editData" :showItem="editData.showType" class="styleBox" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="editConfirm(editData)">确定</el-button>
      </span>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { getLayerData, clearMapMarker, flyTo } from '@/utils/map/map';
import { get, post, del, put } from '@/utils/fetch/fetch';
import { CirclePlus, Edit, Search, Delete, Message, Close } from '@element-plus/icons-vue';
import Draw from './drawFn.js';
import { useMapStore } from '@/store/map';
import point from '/public/images/marker/point.png';
import { WallDiffuseMaterialProperty } from '@/utils/cesiumExtend/cesiumTool';
import * as turf from '@turf/turf';
const { proxy } = getCurrentInstance();
const mapStore = useMapStore();
declare const window: any;
interface typeObject {
  [key: string]: any;
}
const visible = ref<boolean>(false);
const outerUseMask = ref<boolean>(false); // 外部使用
const editVisible = ref<boolean>(false);
const tabsActive = ref<number>(0);

const tabsList = ref<typeObject>([
  { name: '当前标绘', id: 0 },
  { name: '历史标绘', id: 1 },
]);
// const fileName = ref('')
const activeItem: typeObject = ref({}); // 选中项配置
const activeData: typeObject = ref({}); // 选中数据
let plotDataAll: any = ref([]); // 所有数据 包含历史

const defaultFormVal = {
  // 设置默认参数
  imgUrl: '', //点样式
  pointSize: 1, //点位大小
  textColor: '#BCA00D', //标注颜色
  textSize: 16, //标注大小
  style: 'solid', //样式
  color: '#BCA00D', //填充
  borderColor: '#BCA00D', //边框,线条颜色
  borderSize: 4, //粗细
  alpha: 0,
};

const formData: any = ref({});
const editData: any = ref({});
const editHistoryState: any = ref(false);
let saveData: any = ref({
  // 当前所有标绘
  name: '',
  data: [],
});

const plotType = ref([
  // 标会类型
  {
    label: '手势',
    type: 'shoushi',
    // icon:new URL('/public/images/plot/dian.png',import.meta.url).href,
    icon: 'shouzhang',
    showType: [],
  },
  {
    label: '点',
    type: 'drawPoint-custom',
    // icon:new URL('/public/images/plot/dian.png',import.meta.url).href,
    icon: 'dian',
    showType: [1, 2, 3, 4],
  },

  // { label:'铅笔',type:'pen',
  //   icon:'qianbi',
  //   showType:[5,6,9]
  // },
  // { label:'直线',type:'line',
  //   icon:'zhixian',
  //   showType:[5,6,9]
  // },
  // { label:'任意形状',type:'arbitrarily',
  //   icon:'ziyou',
  //   isSearch:true,
  //   showType:[7,8,9]
  // },

  {
    label: '文本',
    type: 'text',
    // icon:new URL('/public/images/plot/dian.png',import.meta.url).href,
    icon: 'text',
    showType: [3, 4],
  },
  { label: '折线', type: 'brokenLine', icon: 'zhexian', double: true, showType: [5, 6, 9] },
  // { label: "矩形", type: "rect",  icon:'juxing', isSearch:true, showType:[7,8,9] },
  // { label: "等边形", type: "equilateral",  icon:'arbitrarily', isSearch:true, showType:[7,8,9] },

  { label: '多边形', type: 'polygon', icon: 'sanjiaoxing', double: true, isSearch: true, showType: [7, 8, 9] },
  { label: '圆形', type: 'circle', icon: 'yuanxing', isSearch: true, showType: [7, 8, 9] },
  { label: '箭头', type: 'arrow', icon: 'jiantou', showType: [7, 8, 9] },
  { label: '攻击箭头', type: 'attackArrow', icon: 'swallow-tail-arrow', showType: [7, 8, 9], double: true },
  // { label: "钳击箭头", type: "pincerArrow",
  //   icon:'shuangjiantou',
  //   showType:[7,8,9],pointNum:5
  // },
]);
const vDrawScroll = {
  mounted(el: any) {
    const div = el;
    function moveFn(type: string) {
      div.onmousedown = (e) => {
        e.preventDefault();
        const clientType = type == 'x' ? 'Width' : 'Height',
          scrollType = type == 'x' ? 'Left' : 'Top';
        const maxWH = div['scroll' + clientType] - div['clinet' + clientType],
          pscollXY = div['scroll' + scrollType];
        document.onmousemove = (o) => {
          const pageType: string = type == 'x' ? 'X' : 'Y';
          let moveXY = e['page' + pageType] - o['page' + pageType];
          let res = pscollXY + moveXY < 0 ? 0 : pscollXY + moveXY > maxWH ? maxWH : pscollXY + moveXY;
          type == 'x' ? div.scrollTo(res, 0) : div.scrollTo(0, res);
        };
        document.onmouseup = (o) => {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
    nextTick(() => {
      if (div.scrollWidth > div.clientWidth) {
        moveFn('x');
      } else if (div.scrollHeight > div.clientHeight) {
        moveFn('y');
      }
    });
  },
};

const plotDataAllTableHeight = computed(() => {
  // 标会表格动态高度
  const box: any = document.querySelector('.plot-box').querySelector('.content');
  return box.offsetHeight;
});
function tabsChange(item: typeObject) {
  tabsActive.value = item.id;
  if (item.id) drawItem();
}
function searchItem(item, rightClick) {
  activeData.value = item;
  let activeDrawItem = null;
  if (item.config.type != 'circle') {
    activeDrawItem = drawData.value.filter(({ objId }) => objId == item.objId)[0];
  }
  mapStore.plotSearchParam = item;
  // ================暂存
  if (!activeData.value.checkedList) activeData.value.checkedList = {};
  proxy.$emitter.emit('MapQueryLayerDialogBus', { checkedList: activeData.value.checkedList, activeDrawItem });
  jumpFn(item, rightClick);
}

// ================暂存

let drawData: any = ref([]), // 保存当前绘制
  recData: any = [], // 删除后需要恢复数据
  selectId: any = ref(''), // 选中删除的id
  controlFlags: any = {
    // 键盘、鼠标控制移动地图
    looking: false,
    moveForward: false,
    moveBackward: false,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
  };

const deleteSelect: any = async (row: any) => {
  // const activeData.value.checkedList.map()
  ElMessageBox.confirm(`是否移除标绘【${row.name}】`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      removeGAOLIANG();
      clearMapMarkerFn(row);
      selectId.value = row.objId;
      deleteDrawDataItem(selectId.value);
      saveData.value.data = saveData.value.data.filter((o) => o.objId !== selectId.value);
      selectId.value = '';
    })
    .catch(() => {});
};
function clearMapMarkerFn(row: any = {}) {
  const delName = [];
  if (row.checkedList) {
    for (let key in row.checkedList) {
      const customName = key == '人口数据' ? key : '';
      // const option = row.checkedList[key].map((o) => o + customName);
      const option: string[] = [];
      row.checkedList[key].map((o: string) => {
        const nameList = customName ? [o + customName, o] : [o];
        option.push(...nameList);
      });
      delName.push(...option);
    }
  }
  if (row.objId) clearMapMarker(delName, row.objId, '');
}
function deleteDrawDataItem(id: string) {
  if (!id) return;
  const drawDataItem = drawData.value.filter((o: any) => o.objId == id)[0];
  if (drawDataItem) {
    drawDataItem.clear(drawDataItem);
    drawData.value = drawData.value.filter((o: any) => o.objId != id);
  }
}
const isShoushi = ref(true);
function plotClick(item: typeObject) {
  // 开启标会
  if (item) {
    activeItem.value = { ...item, ...formData.value };
    changeSaveData(); // 切换默认保存标会
    if (item.type) drawItemStart('isSwitch');
    if (item.type == 'shoushi') {
      return (isShoushi.value = false);
    } else {
      if (!isShoushi.value) isShoushi.value = true;
    }
  }
}
const drawItem: any = () => {
  // 绘制完成  默认手势
  plotClick(plotType.value[0]);
};
const thisScope = computed(() => {
  return {
    drawData: drawData.value,
    recData,
    selectId: selectId.value,
    controlFlags,
    deleteSelect,
    drawItem,
  };
});
function drawItemStart(isSwitch: string | undefined) {
  const drawItem = new Draw(thisScope.value, window.viewer, activeItem.value);
  drawItem.start({ isSwitch }, (e) => {
    // 保存已放置  changeSaveData() 里面保存
    // // 绘制完成回调
    // if (['eraser'].includes(e.config.type) || (!['drawPoint', 'drawPoint-custom', 'text'].includes(e.config.type) && e.positions.length < 2) || (e.positions?.length > 1 && e.positions[0].toString() == e.positions[1].toString())) return;
    // const positions = e.save();
    // // if(that.curConfig.isSearch){
    // //   that.searchItem(positions,'add');
    // // }
    // window.plotNumber++;
    // saveData.value.data.unshift(positions); // 无需弹窗
  });
}
function editConfirm(data: any = {}) {
  removeGAOLIANG();
  activeData.value.name = JSON.parse(JSON.stringify(data.name));
  activeData.value.config = data;
  const objId = activeData.value.objId;
  deleteDrawDataItem(objId);

  const drawItem = new Draw(thisScope.value, window.viewer, activeData.value.config, objId, 'isChange');
  drawItem.creatByData(activeData.value);
  drawData.value.push(drawItem);
  // delete activeData.value。config.name
  editVisible.value = false;
}
function editItem(row: any = {}) {
  activeData.value = row; // 保留当前编辑数据
  editData.value = row.config || {}; // 当前编辑配置
  editData.value.name = row.name;
  editVisible.value = true;
}
async function delHistory(item: any) {
  // 删除整条历史标会
  // const activeData.value.checkedList.map()
  ElMessageBox.confirm(`是否移除【${item.name}】`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // 删除历史
      const { code, msg } = await del('/biz/lhzh/civilbidding/' + item.id);
      if (code != 200) return ElMessage.error(msg);
      if (saveData.value.id == item.id) {
        // saveData.value.data.map((row) => {
        //   clearMapMarkerFn(row);
        // });
        clearAllFn();
      }
      plotDataAll.value = plotDataAll.value.filter((o) => o.id != item.id);
    })
    .catch(() => {});
}
function editHistory(item: any) {
  //编辑历史数据
  editHistoryState.value = true;
  if (saveData.value.id == item.id) return ElMessage.warning(`【${item.name}】已处于编辑状态`);
  // saveData.value.data.map((row) => {
  //   clearMapMarkerFn(row);
  // });
  clearAllFn();
  nextTick(() => {
    const duplicateRemoval = [];
    saveData.value = JSON.parse(JSON.stringify(item));
    tabsActive.value = 0;
    showData();
  });
}
function changeSaveData() {
  // 切换标会自动保存
  let scope = window.scope;
  if (scope && !saveData.value.data.some(({ objId }) => objId == scope.objId) && scope.positions.length) {
    if (!['drawPoint', 'drawPoint-custom', 'text'].includes(scope.config.type) && scope.positions.length < 2) return;
    const positions = scope.save();
    // await this.biddingFn('add',positions) // 新增

    // const { config, addDraw } = scope; // 添加墙体test
    // if (addDraw?._polyline) {
    //   const positions = scope.addDraw._polyline.positions.getValue();
    //   addDraw.wall = wallFn(config, positions);
    // }
    drawData.value.push(scope); ///=======================
    saveData.value.data.unshift(positions);
    scope = null;
  }
}
function wallFn(config, positions) {
  // 添加墙体
  let { color, alpha = 0.5, borderColor } = config;
  let speed = 10;
  return {
    positions, // 设置高度
    maximumHeights: new Array(positions.length).fill(200),
    // new Cesium.CallbackProperty(() => {
    //   wallHeight += 1 * speed; // 判断扩散的实际半径和高度是否超出范围
    //   if (wallHeight > 500 || wallHeight < 1) {
    //     wallHeight = 1;
    //   }
    //   return new Array(positions.length).fill(wallHeight);
    // }, false),
    minimunHeights: new Array(positions.length).fill(0), // 扩散墙材质
    material: new WallDiffuseMaterialProperty({
      color: Cesium.Color.fromCssColorString(borderColor), //.withAlpha(0.5),
    }),
  };
}

function removeGAOLIANG() {
  let selectEntity = window.viewer.entities.getById('高亮显示'); // 获取跳转id
  if (selectEntity) {
    window.viewer.entities.remove(selectEntity);
  }
}
function jumpFn(item, rightClick) {
  if (item?.objId) {
    selectId.value = item.objId;
    function HighlightPolygonEntity(id) {
      removeGAOLIANG();
      if (!id) {
        return;
      }
      let rows = window.viewer.entities.getById(id);
      if (!rows) return;

      if (rows?._children?.length) {
        rows = rows._children[rows._children.length - 1];
      }
      let positions = rows?.polyline?.positions;
      // positions = rows.polygon.hierarchy.getValue().positions;
      if (item.config.type.includes('drawPoint')) {
        function update() {
          const r = 200;
          let circle = new Cesium.CircleOutlineGeometry({
            center: rows?.position?._value,
            radius: r || r + 1,
            granularity: 0.02,
          });
          let geometry = Cesium.CircleOutlineGeometry.createGeometry(circle);
          const positionsArr = geometry.attributes.position.values; //转成数组
          const result = [];
          for (var i = 0; i < positionsArr.length; i += 3) {
            const rows = positionsArr.slice(i, i + 3);
            result.push({ x: rows[0], y: rows[1], z: rows[2] });
          }
          return [...result, result[0]];
        }
        positions = update();
      } else if (item.config.type == 'text') {
        let location = item?.position?.[0],
          locationArr = [];
        if (location) {
          positions = [];
          locationArr = [[location[0] - 0.003, location[1]], location, [location[0] + 0.003, location[1]]];
          locationArr.forEach((item) => {
            positions.push(Cesium.Cartesian3.fromDegrees(item[0], item[1]));
          });
        }
      }

      let selectEntity = window.viewer.entities.add({
        id: '高亮显示',
        polyline: {
          positions,
          width: 10,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.5, // 一个数字属性，指定发光强度，占总线宽的百分比。
            color: Cesium.Color.ORANGERED,
          }),
          clampToGround: true,
        },
      });

      if (!rightClick) {
        let flyPromise = window.viewer.flyTo(selectEntity, {
          duration: 1,
          offset: {
            heading: Cesium.Math.toRadians(0), //左右方向
            pitch: Cesium.Math.toRadians(-89), //上下方向
            range: 8000, //镜头（屏幕）到定位目标点（实体）的距离
          },
        });
      }
    }
    HighlightPolygonEntity(item.objId);
  }
}
async function saveFn() {
  // 保存当前标会数据
  // 保存数据
  if (!saveData.value.name?.trim()) return ElMessage.error('文件名称不能为空!');
  let allItem = plotDataAll.value.filter((o) => o.id == saveData.value.id)[0];
  if (allItem) {
    const res = JSON.parse(JSON.stringify(saveData.value));
    const { code, msg } = await put('/biz/lhzh/civilbidding', res); //=新增或修改
    if (code == 200) Object.assign(allItem, res);
    else return ElMessage.error(msg);
  } else {
    const param = { ...saveData.value, id: new Date().getTime() };
    const { code, msg } = await post('/biz/lhzh/civilbidding', param);
    if (code == 200) plotDataAll.value.unshift(param);
    //=保存
    else return ElMessage.error(msg);
  }
  ElMessage.success(`标绘【${saveData.value.name}】保存成功!`);
  // cancelFn()
  // console.log(JSON.stringify(plotDataAll.value),"==plotDataAll==");
}
function cancelFn() {
  // 清除所有
  editHistoryState.value = false;
  clearAllFn();
  // saveData.value = { data: [] };
}
function clearAllFn() {
  // 清除所有
  removeGAOLIANG();
  saveData.value.data.map((row: any) => {
    // 移除人口 楼栋点位
    clearMapMarkerFn(row);
  });
  drawData.value.forEach((item: any) => {
    item.clear(item);
    // clearMarkers(item.objId) // 清空搜索
  });
  drawData.value = [];
  saveData.value.data = [];
  drawItem();
}
function showData() {
  // 默认载入数据
  if (!saveData.value.data) return;
  saveData.value.data.forEach((item: any) => {
    if (item.tagId) item.tagId = []; // 移除不用默认选中的id
    const rows = plotType.value.filter(({ type }) => type == item.config.type)[0] || {};

    if (rows.double) item.config.double = rows.double;
    if (rows.showType) item.config.showType = rows.showType;
    if (rows.isSearch) item.config.isSearch = rows.isSearch;
    if (item.desc) item.config.desc = item.desc;

    const drawItem = new Draw(thisScope.value, window.viewer, item.config, item.objId, 'isChange');
    drawItem.creatByData(item);
    drawData.value.push(drawItem);
  });
  // window.plotNumber = saveData.value.data.length;
  drawItem();
}
// ========== 样式管理 ==============

const styleOption: typeObject = ref([]);
const pointSizeOption = [1.3, 1, 0.8, 0.6];
formData.value = JSON.parse(JSON.stringify(defaultFormVal));
const styleManage = ref([
  {
    label: '点样式',
    id: 'imgUrl',
    unitType: 'ElSelect',
    vBind: { placeholder: '请选择' },
    option: styleOption,
    vSlot: {
      name: 'prefix',
      html: function (data, object) {
        return `<img src='${data[object.id]}' width='18px'/>`;
      },
      optionSlot: function (object, item) {
        return `<img src="${item.imgUrl}" width="20px" style="display:inline-block;margin-right:5px;" />${item.label}`;
      },
    },
    showType: 1,
    // },{ label:'图片',id:'pic',unitType:'ElImage',vBind:{ src:formData.value.imgUrl }, // 图片
  },
  {
    label: '点位大小',
    id: 'pointSize',
    unitType: 'ElRadioGroup',
    option: pointSizeOption,
    itemHtml: function (data, object, item) {
      return `<img src='${data['imgUrl']}' width="${data.imgUrl ? item * 15 : 0}px"/>`;
    },
    showType: 2,
  },
  {
    label: '标注颜色',
    id: 'textColor',
    unitType: 'ElColorPicker',
    defaultColor: ['#000', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff'],
    vBind: {},
    showType: 3,
  },
  {
    label: '标注大小',
    id: 'textSize',
    unitType: 'ElInputNumber',
    vBind: { min: 12, size: 'small', controlsPosition: 'right', precision: 0 },
    vSlot: {
      unitAppend: function (data, object) {
        return `<span class="m-l-1">px</span>`;
      },
    },
    showType: 4,
  },

  {
    label: '样式',
    id: 'style',
    unitType: 'ElRadioGroup',
    option: ['solid', 'dashed'],
    itemHtml: function (data, object, item) {
      return item == 'solid' ? '—' : '---';
    },
    showType: 5,
  },
  {
    label: '颜色',
    id: 'borderColor',
    unitType: 'ElColorPicker',
    defaultColor: ['#000', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff'],
    vBind: {},
    showType: 6,
  },

  {
    label: '填充',
    id: 'color',
    unitType: 'ElColorPicker',
    defaultColor: ['#000', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff'],
    vBind: {},
    showType: 7,
  },
  {
    label: '透明度',
    id: 'alpha',
    unitType: 'ElSlider',
    vBind: { showAlpha: false, max: 1, min: 0, step: 0.1, size: 'small', style: { width: '80%' } },
    showType: 8,
  },
  {
    label: '边框',
    id: 'borderColor',
    unitType: 'ElColorPicker',
    defaultColor: ['#000', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff'],
    vBind: {},
    showType: 8,
  },
  {
    label: '粗细',
    id: 'borderSize',
    unitType: 'ElInputNumber',
    vBind: { min: 1, size: 'small', controlsPosition: 'right', precision: 0 },
    vSlot: {
      unitAppend: function (data, object) {
        return `<span class="m-l-1">px</span>`;
      },
    },
    showType: 9,
  },
]);
const editStyleManage = [
  {
    label: '名称',
    id: 'name',
    unitType: 'ElInput',
    vBind: {},
    show: true,
  },
  ...styleManage.value,
];
// ========== 样式管理 ==============

function maskRightClick(e) {
  var pick = window.viewer.scene.pick({ x: e.pageX, y: e.pageY });
  if (Cesium.defined(pick) && pick.id && (pick.id.objId || pick.id.chooseId)) {
    const items = saveData.value.data.filter(({ objId }) => objId == (pick.id.objId || pick.id.chooseId))[0];
    if (!items) return;
    if (items.config && items.config?.hasOwnProperty('isSearch')) searchItem(items, 'rightClick');
    else if (items) jumpFn(items, 'rightClick');
    // if(items) jumpFn(items,'rightClick');

    // nextTick(()=>{
    //   const div = document.querySelector('.historyList');
    //   if(div){
    //     const active = div.querySelector('.active');
    //     if(active){
    //       if(active.offsetTop - div.offsetTop < div.scrollTop || active.offsetTop - div.offsetTop > div.scrollTop + div.offsetHeight){
    //         div.scrollTo(0,active.offsetTop - div.offsetTop)
    //       }
    //     }
    //   }
    // })
  }
}
function loadkeyFn() {
  // 加载键盘事件wsadqe
  // return;
  var { scene, canvas } = window.viewer;
  canvas.setAttribute('tabindex', '0');
  canvas.onclick = function () {
    canvas.focus();
  };
  var ellipsoid = scene.globe.ellipsoid;

  var startMousePosition, mousePosition;
  var handler = new Cesium.ScreenSpaceEventHandler(canvas);

  handler.setInputAction((event) => {
    if (event.position) maskRightClick({ pageX: event.position.x, pageY: event.position.y });
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  handler.setInputAction((evt) => {
    const pick = scene.pick(evt.position);
    if (Cesium.defined(pick) && pick.id) {
      if (pick.id.objId) {
        // let selectItem;
        // if(this.selectId){
        //   selectItem = this.saveData.filter(({objId})=>objId == this.selectId)[0] || {};
        // }
        // if(selectItem?.config.hasOwnProperty('isSearch')){
        //   const idList = selectItem?.tagId?.map(o=>Number(o)) || [];
        //   this.$refs.resourceBar.$refs.tree.setCheckedKeys(idList.reverse());
        //   this.$refs.resourceBar.init({data:selectItem,defaultIdList:idList,isOpen:false})
        //   let areas = 0;
        //   let rows =  window.viewer.entities.getById(this.selectId); // id
        //   let positions = rows.polygon.hierarchy.getValue().positions
        //   // areas = this.getArea(positions)
        //   //计算多边形面积
        //   function polgyonArea(points) {
        //     var area = 0;
        //     for (let i = 0; i < points.length; i++) {
        //         let j = (i + 1) % points.length;
        //         area += points[i].x * points[j].y;
        //         area -= points[i].y * points[j].x;
        //     }
        //     // area /= 2;
        //     return Math.abs(area);
        //   }
        //   areas = polgyonArea(positions);
        //   this.$set(this.chooseSearchData,'面积',areas.toFixed(2) + 'm²')
        //   this.searchDetailShow = true;
        // }
      } else if (pick.id.detailTitle == '城市分区') {
        const item = pick.id.src;
        if (item) {
          const radius = mapStore.plotSearchParam.radius || 3,
            nameType = { building: 'lddm', community: 'sqdm', street: 'jddm' },
            { level, dm, lng, lat } = item;
          const { customRadius, points } = item.defaultVal || {};
          const params = { level, radius: customRadius, dm: item[nameType[dm]], points: JSON.parse(points || 'null'), lng, lat, isPlot: true }; //'点击了城市资源',带入是否楼栋、社区、街道参数 ;
          // this.navBarCallback({name:'',showTitle:true,modalType:'middleModal',modalId:'peripheralAnalysisDetail',slotProps:{level,radius:customRadius,dm:item[nameType[dm]],points:JSON.parse(points||'null'),isPlot:true},styles:{'width':"1000px"}});
          proxy.$emitter.emit('MapQueryLayerDetailDialog', params);
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // handler.setInputAction(function(movement) {
  //   mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
  // }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  handler.setInputAction((event) => {
    var pickedFeature = window.viewer.scene.pick(event.endPosition);
    let div = document.querySelector('#plotDetail'),
      plotCircle = document.querySelector('.plotCircleRadius');
    if (div) div.style.display = 'none';
    plotCircle.style.display = 'none';
    if (!(Cesium.defined(pickedFeature) && pickedFeature.id)) return;

    const detailShowId = ['objId', 'detailTitle'];
    if (detailShowId.some((o) => pickedFeature.id.hasOwnProperty(o))) {
      let left = document.querySelector('#plotMainBox'),
        PL = 0,
        PT = 0;
      if (left) (PL = left.offsetLeft ?? 0), (PT = left.offsetTop ?? 0);

      if (pickedFeature.id.desc || pickedFeature.id.detailTitle == '城市分区') {
        if (!document.querySelector('#plotDetail')) {
          const box = document.createElement('div');
          box.setAttribute('id', 'plotDetail');
          document.body.appendChild(box);
        }
        let div = document.querySelector('#plotDetail');
        div.style.display = 'none';
        if (pickedFeature.id.detailTitle == '城市分区') {
          div.innerHTML = `${pickedFeature.id.showName}`;
        } else {
          div.innerHTML = `<h3>${pickedFeature.id.label.text._value}</h3>${pickedFeature.id.desc || ''}`;
        }
        div.style.position = 'absolute';
        div.style.left = event.endPosition.x + PL + 'px';
        div.style.top = event.endPosition.y + PT + 20 + 'px';
        div.style.display = 'block';
      }
      if (pickedFeature.id.name == 'circle') {
        const { objId, position } = pickedFeature.id;
        const itemData = saveData.value.data.filter((o) => o.objId == objId)[0];
        if (itemData) {
          plotCircle.innerHTML = `半径: ${((itemData.radius || itemData.config.radius) / 1000).toFixed(2)}km`;
          plotCircle.style.left = event.endPosition.x + PL + 'px';
          plotCircle.style.top = event.endPosition.y + PT + 50 + 'px';
          plotCircle.style.display = 'block';
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  function getFlagForKeyCode(keyCode) {
    switch (keyCode) {
      case 'W'.charCodeAt(0):
        return 'moveForward';
      case 'S'.charCodeAt(0):
        return 'moveBackward';
      case 'Q'.charCodeAt(0):
        return 'moveUp';
      case 'E'.charCodeAt(0):
        return 'moveDown';
      case 'D'.charCodeAt(0):
        return 'moveRight';
      case 'A'.charCodeAt(0):
        return 'moveLeft';
      default:
        return undefined;
    }
  }

  // document.addEventListener('keydown', e=> {
  //   var flagName = getFlagForKeyCode(e.keyCode);
  //   const div = document.querySelector('.marker-text') || document.querySelector('.el-overlay'); // 判断是否在输入文本
  //   if (typeof flagName !== 'undefined' && !(div&&div.style.display =='block')) {
  //       this.controlFlags[flagName] = true;
  //   }
  // }, false);

  // document.addEventListener('keyup', e=>{
  //   var flagName = getFlagForKeyCode(e.keyCode);
  //   if (typeof flagName !== 'undefined') {
  //       this.controlFlags[flagName] = false;
  //   }
  // }, false);

  window.viewer.clock.onTick.addEventListener((clock) => {
    var camera = window.viewer.camera;
    if (controlFlags.looking) {
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      var x = (mousePosition.x - startMousePosition.x) / width;
      var y = -(mousePosition.y - startMousePosition.y) / height;

      var lookFactor = 0.05;
      camera.lookRight(x * lookFactor);
      camera.lookUp(y * lookFactor);
    }

    var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
    var moveRate = cameraHeight / 100.0;

    if (controlFlags.moveForward) {
      // camera.moveForward(moveRate);
      camera.moveUp(moveRate);
    }
    if (controlFlags.moveBackward) {
      // camera.moveBackward(moveRate);
      camera.moveDown(moveRate);
    }
    if (controlFlags.moveUp) {
      // camera.moveUp(moveRate);
      camera.moveForward(moveRate);
    }
    if (controlFlags.moveDown) {
      // camera.moveDown(moveRate);
      camera.moveBackward(moveRate);
    }
    if (controlFlags.moveLeft) {
      camera.moveLeft(moveRate);
    }
    if (controlFlags.moveRight) {
      camera.moveRight(moveRate);
    }
  });
}

function resize() {
  const cesiumDiv: any = document.querySelector('#cesiumContainer'); //.querySelector('.cesium-viewer');//canvas
  let mask: any = document.querySelector('.cesium-mask');
  const style: typeObject = {
    position: 'absolute',
    top: cesiumDiv.offsetTop,
    left: cesiumDiv.offsetLeft,
    width: cesiumDiv.offsetWidth + 'px',
    height: cesiumDiv.offsetHeight + 'px',
    background: '#000',
    opacity: 0,
    // 'z-index': 1,
  };
  for (let k in style) {
    mask.style[k] = style[k];
  }
}
async function getPointOption() {
  const { code, data = [], msg } = await get('/biz/poi/poiList');
  if (code == 200) {
    styleOption.value = data.map((o: any) => ({ label: o.imgName, imgUrl: o.accessUrl }));
    formData.value.imgUrl = styleOption.value[0]?.imgUrl;
  }
}
async function init() {
  nextTick(() => {
    resize();
  });
  window.onresize = (e) => {
    resize();
  };
  proxy.$emitter.on('mapPlotEmit', () => {
    visible.value = !visible.value;
    if (visible.value) {
      tabsChange(tabsList.value[0]);
    }
  });
  proxy.$emitter.on('mapPlotOpenMask', (val: boolean) => {
    outerUseMask.value = val;
  });

  const cesiumDiv: any = document.querySelector('.plot-box'); //.querySelector('.cesium-viewer');//canvas
  let plotCircleRadius: any = document.querySelector('.plotCircleRadius');
  if (!plotCircleRadius) {
    plotCircleRadius = document.createElement('div');
    plotCircleRadius.className = 'plotCircleRadius';
    plotCircleRadius.style.cssText = `position:absolute;z-index:10;display:none;padding:5px 10px;background:#000;color: #fff;border-radius: 5px;
                          background: rgba(24, 69, 137,.8);border: 1px solid #1d60e8;white-space: nowrap;font-size: 20px;`;
    cesiumDiv.parentNode.appendChild(plotCircleRadius);
  }
  const { code, rows, msg } = await get('/biz/lhzh/civilbidding/list');
  if (code == 200) {
    plotDataAll.value = rows ?? [];
    // saveData.value = plotDataAll.value?.[0] // 默认载入第一条数据
  } else {
    ElMessage.error(msg);
  }

  showData();
  loadkeyFn();
  // 启用标会移动功能
  // window.viewer.screenSpaceEventHandler.setInputAction((e) => {
  //     leftDownAction(e);
  // }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // window.viewer.screenSpaceEventHandler.setInputAction((e) => {
  //     mouseMoveAction(e);
  // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // window.viewer.screenSpaceEventHandler.setInputAction((e) => {
  //     leftUpAction(e);
  // }, Cesium.ScreenSpaceEventType.LEFT_UP);
}
// let leftDownFlag:boolean = false,pickedEntity:any = null,startCartesian:any = null;
// function cartesianToLatlng(cartesian) { // 笛卡尔转经纬度
//   const latlng = window.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
//   const lat = Cesium.Math.toDegrees(latlng.latitude); // 纬度
//   const lng = Cesium.Math.toDegrees(latlng.longitude); // 经度
//   const alt = latlng.height;
//   return [lng, lat];
// }
// function getCatesian3FromPX(px) { //屏幕坐标转笛卡尔
//   let cartesian = null;
//   const ray = window.viewer.camera.getPickRay(px);
//   if (!ray) return null;
//   cartesian = window.viewer.scene.globe.pick(ray, window.viewer.scene);
//   return cartesian;
// }
// function leftDownAction(e){
//     let picked = window.viewer.scene.pick(e.position);
//     if (picked?.id?.objId) {
//       leftDownFlag = true;
//       document.body.style.cursor = 'move';
//       pickedEntity = picked;//Cesium.defaultValue(picked.id, picked.primitive.id);
//       //锁定相机
//       window.viewer.scene.screenSpaceCameraController.enableRotate = false;
//       startCartesian = getCatesian3FromPX(e.position)
//       console.log(picked,"====picked");
//   }
// }
// function mouseMoveAction(e){
//   if (leftDownFlag && pickedEntity) {
//       // let ray = window.viewer.camera.getPickRay(e.endPosition);
//       // let cartesian =window.viewer.scene.globe.pick(ray, window.viewer.scene);
//       let cartesian = getCatesian3FromPX(e.endPosition)
//     if(pickedEntity.id?.polyline){
//       var from = turf.point(cartesianToLatlng(startCartesian));
//       var to = turf.point(cartesianToLatlng(cartesian));
//       var bearing = turf.rhumbBearing(from, to);
//       var distance = turf.rhumbDistance(from, to, {units: 'kilometers'});

//       const positions = pickedEntity.id?.polyline?.positions?.getValue()?.map(o=>cartesianToLatlng(o))
//       var poly = turf.polygon([positions]);
//       var translatedPoly = turf.transformTranslate(poly, distance, bearing,{units: 'kilometers'});

//       pickedEntity.id.polyline.positions = new Cesium.CallbackProperty(()=> {
//         return translatedPoly.geometry.coordinates[0].map(o=>Cesium.Cartesian3.fromDegrees(o[0], o[1]));
//         }, false);//防止闪烁，在移动的过程
//       if(pickedEntity.id.polygon){
//         pickedEntity.id.polygon.hierarchy = new Cesium.CallbackProperty(()=> {
//           return new Cesium.PolygonHierarchy(translatedPoly.geometry.coordinates[0].map(o=>Cesium.Cartesian3.fromDegrees(o[0], o[1])));
//         }, false);//防止闪烁，在移动的过程
//       }
//       startCartesian = JSON.parse(JSON.stringify(cartesian))
//     }else{
//       pickedEntity.id.position = new Cesium.CallbackProperty(function () {
//         return cartesian;
//         }, false);//防止闪烁，在移动的过程
//     }
//   }
// }
// function leftUpAction(e){
//   document.body.style.cursor = 'default';
//   // if(pickedEntity){
//     // let position = Cesium.Cartesian3.clone(pickedEntity.id.position.getValue(Cesium.JulianDate.now()));
//     // let orientation = Cesium.Quaternion.clone(pickedEntity.id.orientation.getValue(Cesium.JulianDate.now()));
//   // }
//   leftDownFlag = false;
//   pickedEntity = null;
//   startCartesian = null;
//   // 解除相机锁定
//   window.viewer.scene.screenSpaceCameraController.enableRotate = true;
// }
onMounted(async () => {
  init();
  getPointOption();
});
onBeforeUnmount(() => {
  proxy.$emitter.off('mapPlotOpenMask');
  proxy.$emitter.off('mapPlotEmit');
});
watch(
  formData,
  (val1, old1) => {
    if (val1 && activeItem.value.type) plotClick(activeItem.value);
  },
  { deep: true },
);
watch(visible, (val) => {
  if (!val) clearAllFn();
});
</script>

<style lang="scss">
#plotDetail,
.plotDetail {
  border: 1px solid #20a4f7;
  max-width: 300px;
  background: #20a4f7ad;
  border-radius: 4px;
  padding: 2px 5px;
  color: #fff;
  white-space: nowrap;
  transform: translateX(-50%);
}
.marker-text {
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  .add-marker-container {
    position: absolute;
    z-index: 1111;
    left: 0;
    top: 20%;
    width: 200px;
    background: #fff;
    padding: 10px;
    border-radius: 5px;
    box-sizing: content-box;
  }
  input {
    border: 1px solid #2b89ba;
    height: 30px;
    border-radius: 3px;
    padding: 0 10px;
  }
  button {
    padding: 5px 20px;
    border: 1px solid #ccc;
    margin-right: 10px;
    margin-top: 10px;
    cursor: pointer;
    border-radius: 3px;
  }
  button:hover {
    opacity: 0.9;
  }
  #marker-confirm {
    background: #4173de;
    border-color: #1c4fbb;
    color: #fff;
  }
}
.editPlot,
.plot-box {
  display: flex;
  flex-direction: column;
  .styleBox {
    .el-form {
      background: $bgColor;
      padding: 8px;
      margin-top: 5px;
      border-radius: 3px;
    }
    .el-form-item {
      margin-top: 5px;
      margin-bottom: 0;
    }

    .ElColorPicker-block .el-color-picker {
      .el-color-picker__trigger {
        text-align: center;
        display: inline-block;
        &:after {
          content: '更多';
          position: relative;
          z-index: 1;
          font-size: 14px;
          line-height: 30px;
          color: #20a4f7;
        }
        .el-color-picker__color {
          display: none;
        }
      }
    }
    .el-color-picker__trigger {
      width: 40px;
      border: 0;
      padding: 0;
      .el-icon {
        display: none;
      }
    }
    .el-radio-group {
      .el-radio__input {
        display: none;
      }
      .el-radio__label {
        padding: 0;
        color: #fff;
      }
      label {
        border: 1px solid transparent;
        width: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 5px;
        border-radius: 3px;
        &.is-checked {
          border-color: $active;
        }
      }
    }
  }
}

.editPlot .el-radio-group label span {
  color: #333;
}
.el-color-dropdown {
  input,
  .el-button {
    background: transparent !important;
  }
}
</style>
<style lang="scss" scoped>
:deep(.el-table__inner-wrapper),
:deep(.el-table__body-wrapper) {
  // background: #0F2648;
  th {
    background: #0f2648;
  }
  td,
  th {
    line-height: 40px;
    height: 40px;
    padding: 0 12px;
  }
  tr.active {
    background: rgba(33, 164, 247, 0.4) !important;
  }
}

.tabs {
  li {
    font-size: 16px;
    &.active {
      background: $primary-color;
      color: #fff;
      border-radius: 3px;
    }
  }
}
.overflow {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.content {
  display: flex;
  flex-direction: column;
  > :deep(div) {
    font-size: 14px;
    margin-top: 16px;
    .el-form-item__label {
      color: $active;
      font-size: 14px;
    }
  }
  :deep(.fileNameBox) {
    label {
      vertical-align: middle;
      line-height: 32px;
    }
    .el-input__inner {
      box-shadow: none;
      border: 1px solid $active !important;
      background: transparent !important;
      color: $active;
      &::placeholder {
        color: rgba(32, 165, 247, 0.5);
      }
    }
    // .el-input__clear{
    //   margin-top:$8px
    // }
  }
  .title-label {
    background: #2f67a7;
    color: #fff;
    padding: 0 10px;
    line-height: 40px;
    border-radius: 4px;
    font-size: 16px;
  }
  .typeBox {
    > div {
      max-height: 300px;
    }
    :deep(ul) {
      white-space: nowrap;
      margin: 8px 0;
      li {
        display: inline-block;
        text-align: center;
        border: 1px solid transparent;
        width: 72px;
        height: 74px;
        border-radius: 8px;
        // font-size: 12px;
        overflow: hidden;
        color: #fff;
        cursor: pointer;
        &:not(:first-child) {
          margin-left: 8px;
        }
        background: rgba(2, 11, 38, 0.4);
        // img{display: block; margin: auto; height: 30px;}
        &:hover,
        &.active {
          color: $active;
          background: rgba(33, 164, 247, 0.16);
          border-color: $active;
          .icon-plot {
            fill: $active;
          }
          // img{
          //   fil
          // }
        }
      }
      .el-input-number.is-controls-right .el-input-number__increase {
        height: 12px;
      }
    }
  }
  :deep(.caozuo) {
    .cell > * {
      vertical-align: middle;
      &:not(span):hover {
        cursor: pointer;
        color: $active;
      }
    }
    span {
      font-size: 12px;
      color: #ccc;
      margin: 0 4px;
    }
    .el-icon {
      font-size: 18px;
      svg {
        height: 2em;
        width: 2em;
      }
    }
  }
  :deep(.el-table) {
    border-radius: 3px;
    margin: 8px 0;
    background: transparent;
    &::before,
    .el-table__inner-wrapper:before {
      display: none;
    }
    tr {
      background: transparent;
    }
    th.el-table__cell {
      color: $active;
      border: 0;
    }
    td.el-table__cell {
      color: #fff;
      border: 0;
    }
    tr.el-table__row:hover {
      background: rgba(33, 164, 247, 0.4) !important;
      td {
        background: transparent;
      }
    }
  }
  .bottom-btn {
    position: absolute;
    width: 100%;
    bottom: 16px;
    left: 0;
    padding: 0 16px;
    display: flex;
    button {
      vertical-align: middle;
      flex: 1;
      &:last-child {
        width: 90px;
        flex: initial;
        background: transparent;
        border-color: $active;
      }
    }
  }
  .historyList {
    :deep(li) {
      > * {
        vertical-align: middle;
      }
      span.title {
        width: calc(100% - 56px);
        display: inline-block;
      }
      i {
        cursor: pointer;
      }
      line-height: 30px;
      &:hover,
      &.active {
        background: $bgColor;
        cursor: pointer;
      }
    }
  }
}

.scroll {
  overflow: auto;
  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }
  &::-webkit-scrollbar {
    width: 10px;
    height: 2px;
    background-color: #f5f5f5;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb {
    /* */
    background: #0c4ea2;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-corner {
    background-color: #f5f5f5;
  }
}
.icon-plot {
  vertical-align: -0.15em;
  fill: #fff;
  overflow: hidden;
  width: 40px;
  height: 40px;
  display: block;
  margin: 0 auto;
  padding: 5px;
}
</style>
