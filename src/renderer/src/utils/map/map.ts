import { useMapStore } from '@/store/common';
import BaiduImageryProvider from '@/utils/providers/BaiduImageryProvider.js';
import {
  cesiumConfig,
  mapProviderConfig,
  gisTagIds,
  notMarkerList,
  iServerUrl,
  tencentKey,
  mapCenter,
  mapCode,
  mvtUrl,
  mapAreaMidPoint,
  clusterBG,
} from '@/utils/map/mapConfig';
import { post, get } from '@/utils/fetch';
import CoordTransform from '@/utils/providers/CoordTransform.js';
import * as turf from '@turf/turf';
import { layerConfigurationParameters } from '@/utils/map/layerConfig';
const mapStore = useMapStore();
declare const window: any;
declare const Cesium: any;
let clusterDataSourceList = [];
//根据点位获取一个区域
export const addRegularPrism = (center, radiusInKm, points, isPot = false) => {
  if (!points) points = 64;

  var coords = {
    latitude: center.lat,
    longitude: center.lng,
  };

  var km = radiusInKm;

  var ret = [];
  const pot = [];
  var distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  var distanceY = km / 110.574;

  var theta, x, y;
  for (var i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);

    ret.push({
      x: coords.longitude + x,
      y: coords.latitude + y,
    });
    pot.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);
  pot.push(pot[0]);

  return isPot ? [pot] : ret;
};

// 计算2点之间距离
export const space = (obj1: any, obj2: any) => {
  let lat1 = obj1.lat;
  let lng1 = obj1.lng;
  let lat2 = obj2.y;
  let lng2 = obj2.x;
  var radLat1 = (lat1 * Math.PI) / 180.0;
  var radLat2 = (lat2 * Math.PI) / 180.0;
  var a = radLat1 - radLat2;
  var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  return s * 1000; // 单位米
};

// 地图飞行
export const flyTo = ({
  lng = 114.17944310326004,
  lat = 22.65386345002168,
  duration = 2,
  height,
  pitch = -89,
}: {
  lng?: Number;
  lat?: Number;
  height?: Number;
  duration?: Number;
  pitch?: Number;
}): void => {
  if (!height) {
    //88132
    const result = window.viewer.camera.pickEllipsoid(
      new Cesium.Cartesian2(window.viewer.canvas.clientWidth / 2, window.viewer.canvas.clientHeight / 2),
    );
    const curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
    // const lon = curPosition.longitude * 180 / Math.PI;
    // const lat = curPosition.latitude * 180 / Math.PI;
    const ellipsoid = window.viewer.scene.globe.ellipsoid;
    height = ellipsoid.cartesianToCartographic(window.viewer.camera.position).height || 88132;
  }
  console.log('lng, lat, height: ', lng, lat, height);
  window.viewer.scene.camera.flyTo({
    // eslint-disable-next-line no-undef
    destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
    orientation: {
      // eslint-disable-next-line no-undef
      heading: Cesium.Math.toRadians(0.0),
      // eslint-disable-next-line no-undef
      pitch: Cesium.Math.toRadians(pitch),
      roll: 0.0,
    },
    duration,
  });
};

//地图点击事件
/**
 *
 * @param clickType :string   'LEFT_CLICK' 'MOUSE_MOVE'
 */
export const mapClick = ({ clickType = 'LEFT_CLICK', callback = () => { } }: { clickType?: String; callback?: Function }) => {
  const handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);
  handler.setInputAction((e: any) => {
    let pick: any;
    if (clickType === 'MOUSE_MOVE') {
      pick = window.viewer.scene.pick(e.endPosition);
    } else {
      pick = window.viewer.scene.pick(e.position) || {};
      const ray = window.viewer.camera.getPickRay(e.position);
      const position = window.viewer.scene.globe.pick(ray, window.viewer.scene);
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const height = window.viewer.camera.positionCartographic.height / 1000;
      pick.clickLngLat = [Number(lng), Number(lat), Number(height)];
      // mapStore.clickLngLat = [Number(lng), Number(lat),Number(height)];
    }
    if (pick) pick.pointPosition = e.endPosition || e.position;
    callback && callback(pick);
  }, Cesium.ScreenSpaceEventType[clickType]);
};

//  通用添加点位图层信息
export const addCommonLayer = ({
  list = [],
  field,
  name1 = '',
  name2 = '',
  tagId,
  icon = '/staticRecourse/mapRecourse/marker/point.png',
  layer,
  needGetIcon = false,
  entpName,
  entpContent,
  innerId,
  datasetNames,
  meutBox,
  height = 27,
  width = 22,
  layerItem = {},
  mapTypeArr = [],
  showLayer = true, //图层是否显示
  customName = '', // 自定义名称
}) => {
  let entities = window.viewer.entities;
  const parentMarkerObj = {};
  if (!Array.isArray(list)) list = list.records;
  list.forEach((item) => {
    if (!parentMarkerObj[layer + customName]) {
      parentMarkerObj[layer + customName] = window.viewer.entities.getOrCreateEntity(layer + customName);
      parentMarkerObj[layer + customName].show = showLayer;
      if (customName) {
        if (!mapStore.removeSearchList.includes(layer)) mapStore.removeSearchList.push(layer);
      } else {
        mapStore.removeMapList.push(layer);
      }
    }
    const lng = Number(item.lng || item.longitude || item.geometry?.points[0]?.x);
    const lat = Number(item.lat || item.latitude || item.geometry?.points[0]?.y);
    if (!(lng && lat)) return;
    let type = {};
    let arr = [];
    item.geometry?.points?.map((i) => {
      arr.push(i.x);
      arr.push(i.y);
    });
    // 定义颜色 - 开始 ｜ 颜色有2种模式，对象或字符串，字符串直接传参即可，对象需要的用item.fieldValues[ 0 ]名称作为键名去获取
    let material = null;
    if (typeof layerItem.data?.itemColor === 'object') {
      let color = layerItem.data.itemColor[item.fieldValues[0]] ? layerItem.data.itemColor[item.fieldValues[0]] : '#ffffff';
      material = Cesium.Color.fromCssColorString(color).withAlpha(1);
    } else {
      material = Cesium.Color.fromCssColorString(layerItem.data?.itemColor ?? '#fff').withAlpha(1);
    }
    // 定义颜色 - 结束
    if (layerItem.data?.mapType === 'LINE' || mapTypeArr.includes('LINE')) {
      type.polyline = {
        positions: Cesium.Cartesian3.fromDegreesArray(arr),
        clampToGround: true,
        width: 3,
        height: 1,
        material: material,
      };
    }
    if (layerItem.data?.mapType === 'REGION' || mapTypeArr.includes('POLYGON')) {
      const { partTopo, parts, points, center } = item.geometry;
      const entityTypeList = [];
      let coordinates = []; // 主图形经纬度
      let holes = [];
      let step = 0;
      const addEntity = (src, lng, lat, entityType = {}) => {
        entities.add({
          src: item,
          position: Cesium.Cartesian3.fromDegrees(lng, lat, item.height || 0),
          lng,
          lat,
          itemId: item.id,
          eventReportId: item.eventReportId,
          innerId: innerId || item.gisId || item.id || item.ID,
          innerType: tagId || item.innerType || item.type || layerItem.type,
          entpName: entpName || item.name || item.showName || (item.fieldValues && item.fieldValues[0]) || layer,
          entpContent: entpContent || item.entpContent || `${item[field] ? `${name1}:${item[field]}${name2}<br/>` : ''}经纬度:${lng} - ${lat}`,
          parent: parentMarkerObj[layer + customName], //父实体
          datasetNames: datasetNames || item.datasetNames || layerItem.data?.mapId,
          detailTitle: layer,
          meutBox: meutBox || layerItem.data?.meutBox,
          ...entityType,
        });
      };
      const getPolygon = (coordinates, holes) => {
        return {
          hierarchy: {
            positions: Cesium.Cartesian3.fromDegreesArray(coordinates),
            holes,
          },
          perPositionHeight: 0,
          material: Cesium.Color.fromCssColorString(layerItem.data?.itemColor ?? '#fff').withAlpha(1),
        };
      };
      const getPolyline = (coordinates) => {
        return {
          positions: Cesium.Cartesian3.fromDegreesArray(coordinates),
          clampToGround: true,
          width: 1,
          height: 1,
          material: Cesium.Color.fromCssColorString(layerItem.data?.borderColor ?? '#fff').withAlpha(1),
        };
      };
      parts.forEach((length, index) => {
        const pointList = points.slice(step, step + length)
          .map((point) => [point.x, point.y])
          .flat();
        step += length;

        if (!index) {
          // 主区域经纬度
          coordinates = pointList;
        } else if (partTopo[index] === -1) {
          // 增加区域孔洞
          entityTypeList.push({
            polyline: getPolyline(pointList),
          });
          holes.push({
            positions: Cesium.Cartesian3.fromDegreesArray(pointList),
          });
        } else if (partTopo[index] === 1) {
          // 增加新的区域
          entityTypeList.push({
            polygon: getPolygon(coordinates, holes),
            polyline: getPolyline(coordinates),
          });
          coordinates = pointList;
          holes = [];
        }
        if (index === parts.length - 1) {
          // 完成区域增加
          entityTypeList.push({
            polygon: getPolygon(coordinates, holes),
            polyline: getPolyline(coordinates),
          });
        }
      });
      // 添加实例
      entityTypeList.forEach((entityType) => {
        addEntity(item, lng, lat, entityType);
      });
    }
    if (layerItem.data?.mapType === 'POINT' || mapTypeArr.includes('POINT')) {
      type.billboard = {
        // image: "/static/icon/defaultMarker.png",
        image: item.icon || icon,
        height: item.height || height,
        width: item.width || width,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: 10000,
        scale: 1,
      };
    }
    if (item?.mapTypeArr?.includes('label')) {
      type.label = {
        text: item.showName || item.label || item.name,
        font: '20pt monospace',
        style: item.style ? Cesium.LabelStyle[item.style] : Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 5,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, item.height ? 0 : -50),
        fillColor: Cesium.Color.fromCssColorString(item.labelColor || 'red'),
        showBackground: item.showBackground,
        backgroundColor: Cesium.Color.fromCssColorString(item.backgroundColor),
        disableDepthTestDistance: 10000,
        backgroundPadding: new Cesium.Cartesian2(10, 5),
      };
    }
    const defaultVal = item.defaultVal || {};
    // 绘点并存入
    entities.add({
      src: item,
      position: Cesium.Cartesian3.fromDegrees(lng, lat, item.height || 0),
      lng,
      lat,
      itemId: item.id,
      eventReportId: item.eventReportId,
      innerId: innerId || item.gisId || item.id || item.ID,
      innerType: tagId || item.innerType || item.type || layerItem.type,
      entpName: entpName || item.name || item.showName || (item.fieldValues && item.fieldValues[0]) || layer,
      entpContent: entpContent || item.entpContent || `${item[field] ? `${name1}:${item[field]}${name2}<br/>` : ''}经纬度:${lng} - ${lat}`,
      parent: parentMarkerObj[layer + customName], //父实体
      datasetNames: datasetNames || item.datasetNames || layerItem.data?.mapId,
      detailTitle: layer,
      meutBox: meutBox || layerItem.data?.meutBox,
      ...type,
      ...defaultVal,
    });
  });
};

// 清除点位图层信息
export const clearMapMarker = (clearLayerList = mapStore.removeMapList, customName = '', viewer) => {
  // 删除所有点位信息(以title为键存在window.removeMapList下的点位)
  const entities = (viewer || window.viewer).entities;
  clearLayerList?.forEach((res) => {
    const entity = entities.getById(res + customName);
    entity?._children?.forEach((child) => {
      entities.remove(child);
    });
    entities.removeById(res + customName);
  });
  if (customName) {
  } else {
    mapStore.removeMapList = mapStore.removeMapList.filter((layer) => !clearLayerList.includes(layer));
  }
};

//  获取图层数据
export const getLayerData = async ({ lng, lat, item, addMarker = false, pointObj = {}, defaultParams = {}, showLayer = true, customName }) => {
  let resData = []; //列表数据
  let featureCount = 0;
  let featureTotal = 0;
  let icon = ''; //图标
  lng = lng || pointObj.lng;
  lat = lat || pointObj.lat;
  let points = [];

  // // 标绘区域搜索
  //   if(mapStore.plotSearchParam){
  //     customName = mapStore.plotSearchParam.objId
  //     function getCenter(object,getPositions){
  //       let position;
  //       var pyPositions = object?.addDraw?.polygon?.hierarchy?.getValue(Cesium.JulianDate.now())?.positions;
  //       //中心点
  //       if(pyPositions && !getPositions) position = Cesium.BoundingSphere.fromPoints(pyPositions).center;
  //       if(getPositions) position = item?.addDraw?.polygon?.hierarchy?.getValue()
  //       return position;
  //     }
  //     let locationArr = mapStore.plotSearchParam?.position,cartesianArr;
  //     if(mapStore.plotSearchParam?.config?.type == 'circle'){
  //       if(locationArr?.[0]?.[0] && locationArr?.[1]?.[0]){
  //           cartesianArr = [Cesium.Cartesian3.fromDegrees(...locationArr[0]),Cesium.Cartesian3.fromDegrees(...locationArr[1])]
  //           lng = locationArr[0][0];
  //           lat = locationArr[0][1];
  //           const radius = Number(mapStore.plotSearchParam.config.radius) || Math.sqrt(
  //               Math.pow(cartesianArr[0].x - cartesianArr[cartesianArr.length - 1].x, 2) +
  //               Math.pow(cartesianArr[0].y - cartesianArr[cartesianArr.length - 1].y, 2)
  //           );
  //           pointObj.radius = radius
  //           defaultParams = {lat,lng,radius,isSearch:true}
  //           // if(!mapStore.plotSearchParam.tagId) mapStore.plotSearchParam.tagId = [];
  //       }
  //     }else{
  //         if(locationArr?.[0]?.[0]){
  //             cartesianArr = [getCenter(mapStore.plotSearchParam) || Cesium.Cartesian3.fromDegrees(...locationArr[0])];
  //             let points = locationArr.map(item=>{
  //                     return {x:item[0],y:item[1]};
  //                 })
  //             defaultParams = {points,isSearch:true}
  //             // if(!mapStore.plotSearchParam.tagId) mapStore.plotSearchParam.tagId = [];
  //         }
  //     }
  //   }
  // 标绘区域搜索end
  if (defaultParams?.points) {
    points = [...defaultParams.points, defaultParams.points[0]];
  } else if (lng && lat) {
    points = addRegularPrism({ lat, lng }, pointObj.radius / 1000);
    if (pointObj.radius == 0) return resData;
  }
  if (item.data && typeof item.data == 'string') item.data = JSON.parse(item.data);
  if (item.data && item.data.mapType === 'MVT') {
    const mvtMap = mapStore.mvtMap.get(item.data.parent);
    if (!mvtMap) {
      const newMvtMap = window.viewer.scene.addVectorTilesMap({
        url: `/sanfang/iservers/services/${item.data.parent}/restjsr/v1/vectortile/maps/${mvtUrl.get(item.data.parent)}`,
        canvasWidth: 512,
        name: 'testMVT' + new Date().getTime(),
        viewer: window.viewer,
        // maximumLevel : 18,
        // minimumLevel : 9,
        show: true,
        maximumTerrainLevel: 18,
        minimumTerrainLevel: 9,
        customRequestHeaders: {
          token: '-ZS0WbkJd9CnAPfHYj1CdaNFtrFYV8wTAg9PReCxXU6m7ACRJHXeq0cqAzrkajZt763yAFQIipv2SOiWZTZtjg..',
        },
      });
      newMvtMap.readyPromise.then(async (data) => {
        var mapboxStyle = newMvtMap.mapboxStyle;
        //
        mapboxStyle.layers.map((res) => {
          newMvtMap.setLayoutProperty(res.id, 'visibility', 'none');
        });
        item.data.mapId.forEach((id) => {
          newMvtMap.setLayoutProperty(id, 'visibility', 'visible');
        });

        let pointArr = [];
        points.map((res) => {
          pointArr.push(res.x, res.y);
        });
        let adc = await new Promise((resolve) => {
          setTimeout(() => {
            resolve('');
          }, 1000);
        });

        var features = newMvtMap.queryRenderedFeatures(Cesium.Cartesian3.fromDegreesArray(pointArr), {
          layers: [...item.data.mapId],
        });
        let arrID = ['in', '$id'];
        features.map((res) => {
          arrID.push(res.feature.id);
        });
        item.data.mapId.forEach((id) => {
          newMvtMap.setFilter(id, arrID);
        });
      });
      newMvtMap.lineAntialiasing = true;
      mapStore.mvtMap.set(item.data.parent, newMvtMap);
    } else {
      item.data.mapId.forEach((id) => {
        mvtMap.setLayoutProperty(id, 'visibility', 'visible');
      });
      let pointArr = [];
      points.map((res) => {
        pointArr.push(res.x, res.y);
      });
      var features = mvtMap.queryRenderedFeatures(Cesium.Cartesian3.fromDegreesArray(pointArr), {
        layers: [...item.data.mapId],
      });
      let arrID = ['in', '$id'];
      features.map((res) => {
        arrID.push(res.feature.id);
      });
      item.data.mapId.forEach((id) => {
        mvtMap.setFilter(id, arrID);
      });
    }
  } else {
    const areaPoint = JSON.parse(localStorage.getItem('areaPoint') || '{}');
    if (defaultParams.timeType) {
      points = defaultParams.areaCode ? areaPoint[defaultParams.areaCode] : [] || [];
    }
    if (item?.data?.dataSources === 'iServer') {
      let attributeFilter = '';
      item.attributeFilter?.forEach((attribute) => {
        if (attributeFilter.length !== 0) attributeFilter += ' AND ';
        const seachText = `${attribute[0]} ${attribute[1]} ${attribute[2]}`;
        attributeFilter += seachText;
      });
      let pageFiter = '';
      if (item.pageNo && item.pageSize) {
        pageFiter = `${item.attributeFilter.length ? ' AND' : ''} SmID > ${(item.pageNo - 1) * item.pageSize}`;
      }
      var queryData = {
        datasetNames: item.data.mapId,
        maxFeatures: item.pageSize || 10000000,
        getFeatureMode: points.length ? 'SPATIAL' : 'SQL',
        spatialQueryMode: 'CONTAIN',
        geometry: {
          parts: [points.length],
          points: points,
          type: 'REGION',
        },
        queryParameter: {
          attributeFilter: attributeFilter + pageFiter,
          fields: item.data.seachList,
        },
      };
      try {
        const { data: res } = await axios({
          method: 'POST',
          url: `/iserver/services/${
            iServerUrl[item.data.parent]
          }/rest/data/featureResults.json?returnContent=true&token=-ZS0WbkJd9CnAPfHYj1CdaNFtrFYV8wTAg9PReCxXU6m7ACRJHXeq0cqAzrkajZt763yAFQIipv2SOiWZTZtjg..`,
          data: queryData,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (mapCode.has(item.data.title)) {
          store.commit('setStoreLatitudeLongitude', [item.data.title, res]);
        }
        resData = refactorData({ resData: res.features, item });
        featureCount = res.featureCount;
        featureTotal = res.totalCount;
      } catch (error) {
        log.warn('[地图] 超图接口请求异常：', error);
        resData = [];
      }
    }
    if (item?.data?.dataSources === 'bigDatabase') {
      let currentPage = 1;
      const getRes = async function (pageNo = 1, pageSize = 1000, getAll = false) {
        let attributeFilter = '';
        item.attributeFilter?.forEach((attribute) => {
          const seachText = `&${attribute[0]}${attribute[1]}${attribute[2]}`;
          attributeFilter += seachText;
        });
        try {
          const { data: res } = await axios({
            method: 'GET',
            url: `/hotel/api/${item.data.parent}?access_token=1KrZkZihMEeIaKaTs_I8jdXfaJURLPIOtS9MWXpOYDw&@pageNo=${pageNo}&@pageSize=${pageSize}${attributeFilter}`,
          });
          resData.push(...res.records);
          featureCount += res.count;
          featureTotal = res.total;
        if (getAll) await getRes(++currentPage);
        } catch (error) {
          log.warn('[地图] 大数据接口请求异常：', error);
          resData = [];
        }
      };
      if (item.pageNo && item.pageSize) {
        await getRes(item.pageNo, item.pageSize, false);
      } else {
        await getRes(1, 1000, true);
      }
      resData = refactorData({ resData, item });
    }
    if (item?.data?.dataSources === 'sanfang') {
      try {
        const { data: result } = await axios({
          method: item.data.method,
          url: `/sanfang/api/ztcp/${item.data.parent}/${item.data.api}${item.data.parameter}`,
          [item.data.method === 'GET' ? 'params' : 'data']: item.data.queryData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('sanFangToken')}`,
            'Content-Type': 'application/json',
          },
        });
        resData = item.data.slot?.resData ? result.data[item.data.slot.resData] : result.data;
        resData = refactorData({ resData, item });
        featureCount = resData.length;
        featureTotal = resData.length;
      } catch (error) {
        log.warn('[地图] 三防接口请求异常：', error);
        resData = [];
      }
    }
    if (item?.data?.dataSources === 'metadata') {
      resData = state.dataflow[item.data.parent] || [];
      if (item.data.slot?.filterName) {
        resData = resData.filter((data) => data[item.data.slot.filterName] === item.data.slot.filterValue);
      }
      featureCount = resData.length;
      featureTotal = resData.length;
      resData = refactorData({ resData, item });
    }
    if (item?.data?.dataSources === 'weather') {
      const { token: weatherToken = localStorage.getItem('weatherToken') } = state.dataflow?.weather_token?.[0] || {};
      try {
        const { data: res } = await axios({
          method: 'GET',
          url: 'https://aqs.121.com.cn/data/radarAndFY2G/getPttJsonAndPicUrl',
          headers:{
            token: weatherToken,
          }
        });
        if (res.code == 0 && res.data) {
          const url = res.data[item.data.slot.resData];
          const { data: result } = await axios({
            method: 'GET',
            url,
          });
          resData = refactorData({ resData: result, item });
          featureCount = resData.length;
          featureTotal = resData.length;
        }
      } catch (error) {
        log.warn('[地图] 气象接口请求异常：', error);
        resData = [];
      }
    }
    if (item?.data?.dataSources === 'hazardousChemicals') {
      try {
        const { data: result } = await axios({
          method: item.data.method,
          url: `/DataBus/exchange`,
          data: item.data.queryData,
        });
        resData = refactorData({ resData: result.BODY.data, item });
        featureCount = result.BODY.data.length;
        featureTotal = result.BODY.data.length;
      } catch (error) {
        log.warn('[地图] 危化接口请求异常：', error);
        resData = [];
      }
    }
    if (item?.data?.dataSources === 'store') {
      resData = state[item.data.parent] || [];
      if (item.data.slot?.filterName) {
        resData = resData.filter((data) => data[item.data.slot.filterName] === item.data.slot.filterValue);
      }
      featureCount = resData.length;
      featureTotal = resData.length;
      resData = refactorData({ resData, item });
      if (item.name === '雪亮工程') {
        const regionType = ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区', '盐田区', '坪山区', '龙华区', '大鹏区', '光明区', '深汕合作区'];
        if (clusterDataSourceList.length) {
          clusterDataSourceList.forEach((s) => {
            s.show = true;
          });
        } else clusterData(regionType, resData);
        return { resData, featureCount, featureTotal };
      }
    }
    if (addMarker) {
      icon = item.icon || undefined;
      if (points.length) {
        // 多边形范围过滤资源
        const turfPoints = points.map(({ x, y }) => [x, y]);
        const turfPoly = turf.polygon([turfPoints]);
        resData = resData.filter((o) => {
          if ((o.lng, o.lat)) {
            const turfPoint = turf.point([Number(o.lng), Number(o.lat)]);
            return turf.booleanPointInPolygon(turfPoint, turfPoly);
          }
        });
      }
      addCommonLayer({
        list: resData,
        icon,
        layer: item.name,
        layerItem: item,
        mapTypeArr: item.data ? [item.data.mapType] : ['POINT'],
        showLayer,
        customName,
      });
    }
  }
  return { resData, featureCount, featureTotal };
};

// 重构数据
export const refactorData = ({ groupName, layerName, resData, item }) => {
  const layerConfig = item || layerConfigurationParameters.get(groupName)?.filter((layer) => layer.name === layerName)[0];
  if (!layerConfig) return [];
  if (layerConfig.name === '输油管线') {
    const res = [];
    const lineMap = new Map();
    let index = 0;
    resData.forEach((point) => {
      const lineName = point.fieldValues[0];
      if (lineMap.get(lineName) === undefined) {
        res.push({
          name: lineName,
          geometry: {
            points: [],
          },
        });
        lineMap.set(lineName, index);
        index += 1;
      }
      res[lineMap.get(lineName)]?.geometry?.points.push(point.geometry?.center);
    });
    return res;
  }
  const { dataSources } = layerConfig.data;
  const getLngLat = (data) => {
    switch (dataSources) {
      case 'iServer':
        data.lng = data?.geometry?.center?.x;
        data.lat = data?.geometry?.center?.y;
        data.showName = data?.fieldValues?.[0] || layerConfig?.name;
        data.name = data?.fieldValues?.[data?.fieldNames.indexOf(item?.data?.slot?.name)] ?? '';
        break;
      case 'bigDatabase':
        data.lng = parseFloat(data.longitude) || parseFloat(data.f_longitude);
        data.lat = parseFloat(data.latitude) || parseFloat(data.f_latitude);
        data.showName = data.team_name;
        break;
      case 'hazardousChemicals':
        data.lng = parseFloat(data.coordinate?.split(',')[0]);
        data.lat = parseFloat(data.coordinate?.split(',')[1]);
        data.showName = data.entpName;
        break;
      default:
        data.lng = parseFloat(data[layerConfig.data.slot?.lng]);
        data.lat = parseFloat(data[layerConfig.data.slot?.lat]);
        break;
    }
    return data;
  };
  const getIcon = (data) => {
    const type = data[layerConfig.data.slot?.icon];
    return layerConfig.data.slot?.iconType?.[type];
  };
  for (let i = 0; i < resData?.length || 0; i++) {
    resData[i].index = i;
    resData[i].showName = resData[i].name;
    resData[i].iconWidth = 26;
    resData[i].iconHeight = 38;
    resData[i].active = false;
    resData[i].meutBox = layerConfig.data.meutBox;
    resData[i].dataSources = layerConfig.data.dataSources;
    resData[i].layerName = layerConfig.data.title;
    resData[i].groupName = groupName || item.groupName || '';
    resData[i] = getLngLat(resData[i]);
  }
  if (layerConfig.data.slot?.icon) {
    for (let i = 0; i < resData?.length || 0; i++) {
      resData[i].icon = getIcon(resData[i]);
    }
  }
  return resData;
};

//切换图层显隐
export const toggleLayer = ({ layerName = 'layer', isMvt = false }: { layerName: string; isMvt?: boolean }) => {
  const layer = window.viewer.entities.getById(layerName);
  if (layer) layer.show = !layer.show;
  if (isMvt && mapStore.mvtMap)
    mapStore.mvtMap.setLayoutProperty(layerName, 'visibility', mapStore.mvtMap.getLayoutProperty(layerName, 'visibility') ? 'none' : 'visible');
};

// 下拉树复选框点击状态变化出发
export const checkboxChecked = ({ allLayer = [], checkedLayer = [], isCache = true, isClear = false }) => {
  // if (defaultParams) isCache = false;
  // const checkBoxData = this.getNodes('checkedList');
  // 未选中图层隐藏
  allLayer
    .filter((sourceItem) => !checkedLayer.includes(sourceItem.name))
    .forEach((sourceItem) => {
      if (sourceItem.name === '雪亮工程') {
        removeClusterDataSource();
        window.viewer.camera.moveEnd.removeEventListener(xueLiangEvent);
      }
      const mvtMap = mapStore.mvtMap.get(sourceItem.data?.parent);
      const layer = window.viewer.entities.getById(sourceItem.name);
      if (layer) layer.show = false;
      if (sourceItem.data?.mapType === 'MVT' && mvtMap) {
        sourceItem.data?.mapId.forEach((id) => {
          mvtMap.setLayoutProperty(id, 'visibility', 'none');
        });
      }
    });
  // 切换半径清除点位图层
  if (!isCache) clearMapMarker();
  // 是否一键清除
  if (isClear) return;
  // 选中图层
  checkedLayer.map((item) => {
    const layer = window.viewer.entities.getById(item.name); //选中的图层
    const mvtMap = mapStore.mvtMap.get(item.data?.parent);
    if (item.data?.mapType === 'MVT' && isCache && mvtMap?.getLayoutProperty(item.data?.mapId[0], 'visibility')) {
      item.data?.mapId.forEach((id) => {
        mvtMap.setLayoutProperty(id, 'visibility', 'visible');
      });
    } else if (layer && isCache) {
      layer.show = true;
      const childEntity = layer._children;
      childEntity.map((child) => {
        child.billboard?.scale?.setValue?.(1);
      });
    } else
      getLayerData({
        item,
        addMarker: !notMarkerList.includes(item.id),
      });
    if (item.name === '雪亮工程') {
      window.viewer.camera.moveEnd.addEventListener(xueLiangEvent);
      const hideFirst = () => {
        removeClusterDataSource();
        window.viewer.scene.postRender.removeEventListener(hideFirst);
      };
      window.viewer.scene.postRender.addEventListener(hideFirst);
    }
    return item;
  });
};

// 测距
export const measureAreaLine = (clientWidth: Number = 1920, clientHeight: Number = 1080) => {
  const viewer = window.viewer;
  const parentEntity = viewer.entities.getOrCreateEntity('measureArea');
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
  const positions = [];
  let poly = null;
  // var tooltip = document.getElementById("toolTip");
  let distance = 0;
  let cartesian = null;
  let floatingPoint;
  // tooltip.style.display = "block";

  handler.setInputAction((movement) => {
    // tooltip.style.left = movement.endPosition.x + 3 + "px";
    // tooltip.style.top = movement.endPosition.y - 25 + "px";
    // tooltip.innerHTML = '<p>单击开始，右击结束</p>';
    // const $head = document.querySelector(".head");
    // const $menuBox = document.querySelector('.menuBox');
    // const outerH = $head.outerHeight();
    // const  outerW = $menuBox.outerWidth();

    movement.endPosition.x += window.pageXOffset - clientWidth;
    movement.endPosition.y += window.pageYOffset;
    const ray = viewer.camera.getPickRay(movement.endPosition);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (positions.length >= 2) {
      if (!Cesium.defined(poly)) {
        poly = new PolyLinePrimitive(positions);
      } else {
        positions.pop();
        // cartesian.y += (1 + Math.random());
        positions.push(cartesian);
      }
      distance = getSpaceDistance(positions);
      //
      // tooltip.innerHTML='<p>'+distance+'米</p>';
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction((movement) => {
    // tooltip.style.display = "none";
    // cartesian = viewer.scene.pickPosition(movement.position);
    movement.position.x += window.pageXOffset - clientWidth;
    movement.position.y += window.pageYOffset;

    const ray = viewer.camera.getPickRay(movement.position);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (positions.length == 0) {
      positions.push(cartesian.clone());
    }
    positions.push(cartesian);
    // 在三维场景中添加Label
    //   var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const textDisance = `${distance}米`;
    //
    floatingPoint = viewer.entities.add({
      name: '直线距离',
      parent: parentEntity,
      // position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
      position: positions[positions.length - 1],
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString('#F36E08'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.MAX_VALUE,
      },
      label: {
        text: textDisance,
        font: '18px sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#fff'),
        style: Cesium.LabelStyle.FILL,//_AND_OUTLINE,
        // outlineWidth: 2,
        showBackground: true,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20),
        outlineColor: Cesium.Color.fromCssColorString('#fff'),
        backgroundColor: Cesium.Color.fromCssColorString('#F36E08'),//Cesium.Color.GOLD,
        disableDepthTestDistance: Number.MAX_VALUE,
      },
    });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction((movement) => {
    handler.destroy(); // 关闭事件句柄
    positions.pop(); // 最后一个点无效
    // viewer.entities.remove(floatingPoint);
    // tooltip.style.display = "none";
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  var PolyLinePrimitive = (function () {
    function _(positions) {
      this.options = {
        name: '直线',
        parent: parentEntity,
        polyline: {
          show: true,
          positions: [],
          material: Cesium.Color.fromCssColorString('#F36E08'),
          width: 4,
          clampToGround: true,
        },
      };
      this.positions = positions;
      this._init();
    }

    _.prototype._init = function () {
      const _self = this;
      const _update = function () {
        return _self.positions;
      };
      // 实时更新polyline.positions
      this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
      viewer.entities.add(this.options);
    };

    return _;
  })();

  // 空间两点距离计算函数
  function getSpaceDistance(positions) {
    let distance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
      const point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
      /** 根据经纬度计算出距离* */
      const geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      let s = geodesic.surfaceDistance;
      //
      // 返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
      distance += s;
    }
    return distance.toFixed(2);
  }
};
// 测面
export const measureAreaSpace = (clientWidth: Number = 1920, clientHeight: Number = 1080) => {
  const viewer = window.viewer;
  const parentEntity = viewer.entities.getOrCreateEntity('measureArea');
  // 鼠标事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
  const positions = [];
  const tempPoints = [];
  let polygon = null;
  let cartesian = null;
  let floatingPoint; // 浮动点
  let isDrawSpace = false
  handler.setInputAction((movement) => {
    // movement.endPosition.y -= document.querySelector('.navWrapper').offsetHeight;
    movement.endPosition.x += window.pageXOffset - clientWidth;
    movement.endPosition.y += window.pageYOffset;
    const ray = viewer.camera.getPickRay(movement.endPosition);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    positions.pop(); // 移除最后一个
    positions.push(cartesian);

    // if (positions.length >= 2) {
    //   const dynamicPositions = new Cesium.CallbackProperty(() => {
    //     return new Cesium.PolygonHierarchy(positions);
    //     return positions;
    //   }, false);
    //  if(isDrawSpace) polygon = PolygonPrimitive(dynamicPositions);
    // }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction((movement) => {
    // movement.position.y -= document.querySelector('.navWrapper').offsetHeight;
    movement.position.x += window.pageXOffset - clientWidth;
    movement.position.y += window.pageYOffset;
    const ray = viewer.camera.getPickRay(movement.position);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (positions.length == 0) {
      positions.push(cartesian.clone());
      isDrawSpace = true
    }
    positions.push(cartesian);
    if (positions.length >= 2) {
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return new Cesium.PolygonHierarchy(positions);
      }, false);

      if (!isDrawSpace) polygon = viewer.entities.add({ // 重复加载
        parent: parentEntity,
        polygon: {
          hierarchy: dynamicPositions,
          material: Cesium.Color.fromCssColorString('#F36E08').withAlpha(0.2),
          clampToGround: true,
        },
        polyline: {
          positions: new Cesium.CallbackProperty(() => ([...positions, positions[0]]), false),
          width: 4,
          material: Cesium.Color.fromCssColorString('#F36E08'),
          clampToGround: true,
        }
      });
      isDrawSpace = true
    }
    // 在三维场景中添加点
    const cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
    const longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
    const latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
    const heightString = cartographic.height;
    const labelText = `(${longitudeString.toFixed(2)},${latitudeString.toFixed(2)})`;
    tempPoints.push({ lon: longitudeString, lat: latitudeString, hei: heightString });
    floatingPoint = viewer.entities.add({
      name: '多边形面积',
      parent: parentEntity,
      position: positions[positions.length - 1],
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString('#F36E08'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.MAX_VALUE,
      },
      label: {
        text: labelText,
        font: '18px sans-serif',
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL,//_AND_OUTLINE,
        // outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -32),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#F36E08'),
      },
    });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction((movement) => {
    handler.destroy();
    positions.pop();
    isDrawSpace = false;
    const textArea = `${getArea(tempPoints)}平方公里`;
    viewer.entities.add({
      name: '多边形面积',
      parent: parentEntity,
      position: positions[positions.length - 1],
      label: {
        text: textArea,
        font: '18px sans-serif',
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL,//_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, 0),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#F36E08'),
      },
    });
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  const radiansPerDegree = Math.PI / 180.0; // 角度转化为弧度(rad)
  const degreesPerRadian = 180.0 / Math.PI; // 弧度转化为角度
  // 计算多边形面积
  function getArea(points) {
    let res = 0;
    // 拆分三角曲面
    for (let i = 0; i < points.length - 2; i++) {
      const j = (i + 1) % points.length;
      const k = (i + 2) % points.length;
      const totalAngle = Angle(points[i], points[j], points[k]);
      const dis_temp1 = distance(positions[i], positions[j]);
      const dis_temp2 = distance(positions[j], positions[k]);
      res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
    }
    return (res / 1000000.0).toFixed(4);
  }

  /* 角度 */
  function Angle(p1, p2, p3) {
    const bearing21 = Bearing(p2, p1);
    const bearing23 = Bearing(p2, p3);
    let angle = bearing21 - bearing23;
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  }
  /* 方向 */
  function Bearing(from, to) {
    const lat1 = from.lat * radiansPerDegree;
    const lon1 = from.lon * radiansPerDegree;
    const lat2 = to.lat * radiansPerDegree;
    const lon2 = to.lon * radiansPerDegree;
    let angle = -Math.atan2(
      Math.sin(lon1 - lon2) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2),
    );
    if (angle < 0) {
      angle += Math.PI * 2.0;
    }
    angle *= degreesPerRadian; // 角度
    return angle;
  }

  function PolygonPrimitive(positions) {
    polygon = viewer.entities.add({
      parent: parentEntity,
      polygon: {
        hierarchy: positions,
        material: Cesium.Color.fromCssColorString('#F36E08').withAlpha(0.1),
      },
      polyline: {
        hierarchy: positions,
        width: 4,
        material: Cesium.Color.fromCssColorString('#F36E08'),
      },
    });
  }

  function distance(point1, point2) {
    const point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    const point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    /** 根据经纬度计算出距离* */
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    let s = geodesic.surfaceDistance;
    // 返回两点之间的距离
    s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
    return s;
  }
};

// canvas转图片下载
export const canvasDownload = (canvas: any = window.viewer.scene.canvas, filename: string = 'map') => {
  var link = document.createElement('a');
  var imgData = canvas.toDataURL({
    format: 'png',
    quality: 1,
    width: 1920,
    height: 1080,
  });
  var strDataURI = imgData.substr(22, imgData.length);
  var blob = dataURLtoBlob(imgData);
  var objurl = URL.createObjectURL(blob);
  link.download = filename + '.png';
  link.href = objurl;
  link.click();

  function dataURLtoBlob(dataurl: string) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
};

// 卷帘地图
const loadSplitMap = (leftLayer) => {
  // 新版原生cesium
  // leftLayer.splitDirection = Cesium.ImagerySplitDirection.LEFT;
  // const slider = document.createElement("div");
  // slider.id = "slider";
  // document.getElementById("cesiumContainer").append(slider);
  // scene.imagerySplitPosition =
  // slider.offsetLeft / slider.parentElement.offsetWidth;
  // const handler = new Cesium.ScreenSpaceEventHandler(slider);
  // let moveActive = false;
  //

  // function move(movement) {
  //   if (!moveActive) {
  //     return;
  //   }

  //   let relativeOffset = movement.endPosition.x;
  //   let splitPosition =
  //     (slider.offsetLeft + relativeOffset) / slider.parentElement.offsetWidth;
  //   slider.style.left = 100.0 * splitPosition + "%";
  //   scene.imagerySplitPosition = splitPosition;
  // }

  // handler.setInputAction(function () {
  //   moveActive = true;
  // }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // handler.setInputAction(function () {
  //   moveActive = true;
  // }, Cesium.ScreenSpaceEventType.PINCH_START);

  // handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

  // handler.setInputAction(function () {
  //   moveActive = false;
  // }, Cesium.ScreenSpaceEventType.LEFT_UP);
  // handler.setInputAction(function () {
  //   moveActive = false;
  // }, Cesium.ScreenSpaceEventType.PINCH_END);

  // 超图
  let windowWidth = window.innerWidth; // 窗口宽度
  let windowHeight = window.innerHeight; // 窗口高度
  let rollerShutterConfig = {
    // 卷帘配置参数，以对象方式实现地址传递
    splitDirection: new Cesium.Cartesian2(Cesium.ImagerySplitDirection.LEFT, Cesium.ImagerySplitDirection.NONE), // 初始时屏蔽左侧
    verticalSplitPosition: windowWidth / 2,
    horizontalSplitPosition: windowHeight / 2,
    imageryLayers: [leftLayer], // 参与卷帘的影像图层数组
    latestSplitDirection: null, // 用于在禁用卷帘后恢复之前的卷帘方向
  };
  setRollerShutterSplit(window.viewer, rollerShutterConfig);
  bindSliderEvt(window.viewer, rollerShutterConfig);
};

/**
 * 初始化或切换基于cesium的地图图层
 * @param {type} cesium imageryProvider类型  WebMapTileServiceImageryProvider/
 * @param {url} cesium providerurl [url1,url2]
 * @param {options} cesium provider配置
 */
let szTileset: any;
export const initCesiumMap = ({ type, url, options }: { type: Number; url: Array<string>; options: any }, mapType: Number) => {
  let scene = window.viewer.scene;
  let imageryLayers = window.viewer.imageryLayers;
  const isExistCesiumMap = !!imageryLayers; // 是否已存在cesiumMap
  Cesium.Ion.defaultAccessToken = cesiumConfig.defaultAccessToken;
  szTileset && (szTileset.show = false);
  if (!isExistCesiumMap) {
    var obj = [6378137.0, 6378137.0, 6356752.3142451793];
    Cesium.Ellipsoid.WGS84 = Object.freeze(new Cesium.Ellipsoid(obj[0], obj[1], obj[2]));
    window.viewer = mapStore.viewer = new Cesium.Viewer('cesiumContainer', {
      ...cesiumConfig,
    });
    scene = window.viewer.scene;
    imageryLayers = window.viewer.imageryLayers;
    // 开启地图深度，必须开启否则无法准确获取地图点击经纬度
    scene.globe.depthTestAgainstTerrain = true;
    // scene.globe.show = false;
  } else {
    mapStore.imageryLayersList.forEach((imageryLayer: any) => {
      imageryLayers.remove(imageryLayer);
    });
  }
  mapStore.imageryLayersList = [];
  let leftLayer = '';
  url.forEach((urlItem, index) => {
    const imageryLayer = imageryLayers.addImageryProvider(
      new (Cesium[type] || BaiduImageryProvider)({
        url: urlItem,
        layer: `layer-${mapType}-${index}`,
        style: 'default',
        ...options,
      }),
    );
    mapStore.imageryLayersList.push(imageryLayer);
    if (index === 1 && mapType == 5) leftLayer = imageryLayer;
  });
  if (mapType === 3) {
    if (!szTileset) {
      // 三围地图添加深圳地形
      szTileset = new Cesium.Cesium3DTileset({
        url: new Cesium.Resource({
          url: `https://szaqxsbg.szsti.org:8060/gw/TILE_3D_MODEL/sz/shenzhen/tileset.json?time=${Date.now()}`,
          headers: {
            'szvsud-license-key': 'ZBGxP5HNTWsBm9CylbTb/y/fDUZ1tSSOuS7tGiA7R7MgAou3RBv+Cp2oQYrar2Fp',
          },
        }),
        skipLevelOfDetail: true,
        skipLevels: 1,
        skipScreenSpaceErrorFactor: 16,
        immediatelyLoadDesiredLevelOfDetail: false,
        loadSiblings: true,
        cullWithChildrenBounds: true,
        cullRequestsWhileMoving: true,
        cullRequestsWhileMovingMultiplier: 0.01,
        preloadWhenHidden: true,
        progressiveResolutionHeightFraction: 0.1,
        dynamicScreenSpaceErrorDensity: 500,
        dynamicScreenSpaceErrorFactor: 1,
        dynamicScreenSpaceError: true,
        show: true,
      });
      scene.primitives.add(szTileset);
    } else {
      szTileset.show = true;
    }
  }
  if (mapType == 5) {
    loadSplitMap(leftLayer);
  }
  // if (mapType == 17) {
  //   const imageryLayershenshan = imageryLayers.addImageryProvider(
  //     new Cesium.WebMapServiceImageryProvider({
  //       url: new Cesium.Resource({
  //         url: 'http://10.253.102.69/gw/OGC/Map/SZ_IMG_2021/wms130',
  //         headers: {
  //           'szvsud-license-key': 'iFxsV23NZpCFtIjQSbq9vTt9WkuvGAhyk6JOlQc+/Ve8eJyvEr5JAxod8Sh+gF6B',
  //         },
  //       }),
  //       layers: `20201126_sshzq`,
  //     }),
  //   );
  //   mapStore.imageryLayersList.push(imageryLayershenshan);
  // }
  if (mapStore.trafficLayer) {
    window.viewer.imageryLayers.raiseToTop(mapStore.trafficLayer);
  }
  if (!isExistCesiumMap) {
    flyTo({ height: 88132, pitch: -89 });
    mapClick({ clickType: 'LEFT_CLICK' });
    mapClick({ clickType: 'MOUSE_MOVE' });
  }
  // if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
  //   var vtxf_dpr = window.devicePixelRatio;
  //   // 适度降低分辨率
  //   while (vtxf_dpr >= 2.0) {
  //     vtxf_dpr /= 2.0;
  //   }
  //   //alert(dpr);
  //   window.viewer.resolutionScale = vtxf_dpr;
  // }
  mapStore.currentMapType = mapType;
};

// 初始化卷帘。设置分割条初始位置及绑定相关事件
function setRollerShutterSplit(viewer, rollerShutterConfig) {
  const body = document.getElementById('cesiumContainer');
  let splitPosition = null;
  if (
    rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.LEFT, Cesium.ImagerySplitDirection.NONE)) ||
    rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.RIGHT, Cesium.ImagerySplitDirection.NONE))
  ) {
    splitPosition = rollerShutterConfig.verticalSplitPosition;
  } else if (
    rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.NONE, Cesium.ImagerySplitDirection.TOP)) ||
    rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.NONE, Cesium.ImagerySplitDirection.BOTTOM))
  ) {
    splitPosition = rollerShutterConfig.horizontalSplitPosition;
  }
  for (var imageryLayer of rollerShutterConfig.imageryLayers) {
    imageryLayer.splitDirection = rollerShutterConfig.splitDirection;
  }
  if (splitPosition) {
    // 如果禁用卷帘就没有必要设置分割位置
    if (
      rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.LEFT, Cesium.ImagerySplitDirection.NONE)) ||
      rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.RIGHT, Cesium.ImagerySplitDirection.NONE))
    ) {
      viewer.scene.imagerySplitPosition.x = splitPosition / body.offsetWidth;
    } else if (
      rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.NONE, Cesium.ImagerySplitDirection.TOP)) ||
      rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.NONE, Cesium.ImagerySplitDirection.BOTTOM))
    ) {
      viewer.scene.imagerySplitPosition.y = splitPosition / body.offsetHeight;
    }
  }
}
declare const document: any;
//注册卷帘分割条的拖拽事件
function bindSliderEvt(viewer, rollerShutterConfig) {
  let verticalSlider = document.getElementById('slider'); // 垂直分割条
  // let horizontalSlider = document.getElementById('slider'); // 水平分割条
  verticalSlider.addEventListener('mousedown', mouseDown, false);
  // horizontalSlider.addEventListener('mousedown', mouseDown, false);
  let windowHeight = window.innerHeight;
  document.addEventListener('mouseup', mouseUp, false);
  function mouseUp(e: Event) {
    document.removeEventListener('mousemove', sliderMove, false);
  }
  function mouseDown(e: Event) {
    document.addEventListener('mousemove', sliderMove, false);
  }
  function sliderMove(e: Event) {
    // 鼠标拖拽时执行
    // 解决拖拽鼠标粘滞的问题
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
    if (
      rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.LEFT, Cesium.ImagerySplitDirection.NONE)) ||
      rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.RIGHT, Cesium.ImagerySplitDirection.NONE))
    ) {
      verticalSlider.style.left = window.pageXOffset - 1920 + e.clientX + 'px';
      rollerShutterConfig.verticalSplitPosition = window.pageXOffset - 1920 + e.clientX;
    } else if (
      rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.NONE, Cesium.ImagerySplitDirection.TOP)) ||
      rollerShutterConfig.splitDirection.equals(new Cesium.Cartesian2(Cesium.ImagerySplitDirection.NONE, Cesium.ImagerySplitDirection.BOTTOM))
    ) {
      let clientY = e.clientY;
      if (clientY < 0) {
        clientY = 0;
      } else if (clientY > windowHeight) {
        clientY = windowHeight - document.querySelector('#horizontal-slider').innerHeight;
      }
      // horizontalSlider.style.top = clientY + 'px';
      rollerShutterConfig.horizontalSplitPosition = windowHeight - clientY;
    }
    setRollerShutterSplit(viewer, rollerShutterConfig);
  }
}

// 无人机显示隐藏，绘制路线
export const drone = (): void => {
  const viewer = window.viewer;
  const polyLineArr: Array<number> = [];
  /**
   * @function :根据传入参数实时更新模型的的位置和姿态
   * @datetime：2019-2-22 11:07:51
   * @author:一梦
   * @param {*} modelURL  模型url
   * @param {*} isShowInfo 是否显示鼠标当前位置的的经度纬度高程信息
   * @param {*} longitude 经度
   * @param {*} latitude 纬度
   * @param {*} height 高程
   * @param {*} heading 俯仰角
   * @param {*} pitch 偏航角
   * @param {*} roll 滚转角
   */
  const doScene = (
    modelURL: string,
    isShowInfo: boolean = false,
    longitude: number,
    latitude: number,
    height: number,
    heading: number,
    pitch: number,
    roll: number,
  ) => {
    //指定位置
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

    //指定姿态
    const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(heading), Cesium.Math.toRadians(pitch), Cesium.Math.toRadians(roll));
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    const entityPoint = viewer.entities.add({
      id: 'drone',
      //自己指定的位置
      position: position,

      //使用自己指定的姿态角
      orientation: orientation,

      model: {
        uri: modelURL, //飞机模型
        minimumPixelSize: 64,
      },

      //Show the path as a pink line sampled in 1 second increments.
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 1.0,
          color: Cesium.Color.YELLOW,
        }),
        width: 1,
      },
    });
    const entityLine = viewer.entities.add({
      id: 'droneLine',
      polyline: {
        positions: new Cesium.CallbackProperty(() => Cesium.Cartesian3.fromDegreesArrayHeights(polyLineArr), false),
        material: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.ORANGE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
        }),
        width: 5,
      },
    });
  };

  if (typeof WebSocket === 'undefined') {
    alert('您的浏览器不支持socket');
  } else {
    const url = `${location.protocol === 'https' ? 'wss' : 'ws'}://${location.host}/socket`;
    const socket: any = new WebSocket(`${url}/lhzh/websocket`);
    socket.onopen = () => { };
    socket.onerror = () => { };
    socket.onmessage = (res: any) => {
      try {
        const data = JSON.parse(res.data);
        const { longitude, latitude, altitude, altitudeRelative, pitch, roll } = data;
        if (data.type) {
          //无人机在线初始化
          doScene('/staticRecourse/model/drone.glb', false, longitude, latitude, altitude, altitudeRelative, pitch, roll);
        } else if (data.type) {
          //无人机位置更新
          var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude); //(经度，纬度，高程)
          polyLineArr.push(longitude, latitude, altitude);
          var hpr = new Cesium.HeadingPitchRoll(altitudeRelative, pitch, roll);
          var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

          //更新位置
          viewer.entities.getById('drone').position = position;
          //更新姿态
          viewer.entities.getById('drone').orientation = orientation;
        } else {
          //无人机离线
          viewer.entities.removeById('drone');
          viewer.entities.removeById('droneLine');
        }
      } catch { }
    };
    socket.onclose = () => { };
  }
};

/**
 * //地理编码
 * @param address 地址
 * @param key  key
 * @returns  [lat,lng]
 */
export const geocoding = async (address: string, key: string = tencentKey): Promise<any> => {
  let latLng = '';
  const { status, result }: any = await get(`ws/geocoder/v1/?address=${address}&key=${key}`, {}, { unwanted: true });
  if (status === 0) latLng = result.location.lat + ',' + result.location.lng;
  return latLng;
};
/**
 * //逆地理编码
 * @param location 地址
 * @param key  key
 * @returns  string
 */
export const geocoder = async (location: string, resultBool: boolean = false, key: string = tencentKey): Promise<string> => {
  let address = '';
  const { status, result }: any = await get(`ws/geocoder/v1/?location=${location}&key=${key}`, {}, { unwanted: true });
  if (status === 0) address = result.address;
  return resultBool ? result : address;
};

/**
 * 路线规划功能
 * @param type 路线规划类型  driving驾驶  walking 步行 bicycling骑行 transit 公交
 * @param from 起点维度,经度 39.915285,116.403857  传入坐标需为gcj02坐标，高德、或百度
 * @param to   起点维度,经度 39.915285,116.403857
 * @param fromAddress 起点地址,
 * @param toAddress   起点地址,
 * @param isConvert   需要转换坐标 wgs84-gcj02
 * @param get_mp   返回路线条数，默认1 最多3
 */
export const pathPlanning = async ({
  type = 'driving',
  from,
  to,
  isConvert = false,
  get_mp = 1,
  key = tencentKey,
  fromAddress,
  toAddress,
}: {
  type?: string;
  from?: string;
  to?: string;
  isConvert?: boolean;
  get_mp?: number;
  key?: string;
  fromAddress?: string;
  toAddress?: string;
}): Promise<Array<any>> => {
  //转换数据
  const transformData = (polyline: any) => {
    for (let i = 2; i < polyline.length; i++) {
      polyline[i] = polyline[i - 2] + polyline[i] / 1000000;
    }
    const point: number[] = [];
    for (let i = 0; i < polyline.length;) {
      point.push(...CoordTransform.GCJ02ToWGS84(polyline[i + 1], polyline[i]));
      i = i + 2;
    }
    return point;
  };

  let fromCoordinate: string | undefined;
  let toCoordinate: string | undefined;
  if (isConvert) {
    const fromArray: any = from?.split(',');
    const toArray: any = to?.split(',');
    const fromTemp = CoordTransform.WGS84ToGCJ02(fromArray[1], fromArray[0]);
    const toTemp = CoordTransform.WGS84ToGCJ02(toArray[1], toArray[0]);
    from = `${fromTemp[1]},${fromTemp[0]}`;
    to = `${toTemp[1]},${toTemp[0]}`;
  }
  fromCoordinate = from ?? (fromAddress && (await geocoding(fromAddress)));
  toCoordinate = to ?? (toAddress && (await geocoding(toAddress)));

  const { status, result }: any = await get(
    `/ws/direction/v1/${type}?from=${fromCoordinate}&to=${toCoordinate}&key=${key}&get_mp=${get_mp}`,
    {},
    { unwanted: true },
  );
  if (status === 0) {
    result.routes.forEach((route: any) => {
      let road_nameArr: any;
      if (type == 'transit') {
        route.polyline = [];
        route.steps.forEach((step: any) => {
          if (step.polyline) {
            step.polyline = transformData(step.polyline);
            route.polyline.push(...step.polyline);
          } else {
            step.lines.forEach((line: any) => {
              line.polyline = transformData(line.polyline);
              route.polyline.push(...line.polyline);
            });
          }
        });
      } else {
        route.polyline = transformData(route.polyline);
      }
      road_nameArr = [...new Set(route.steps.map((step: any) => step.road_name))];
      route.nameStr = road_nameArr.join('-->');
    });
  }

  return result?.routes;
};

/**
 * 根据关键字获取周边地址
 * @param keyWorld 关键字
 * @returns
 */
export const getSuggestionAddressList = async (keyWorld: string, region: string = '深圳'): Promise<any> => {
  const { data, status }: any = await get(`ws/place/v1/suggestion?keyword=${keyWorld}&key=${tencentKey}&region=${region}`, {}, { unwanted: true });
  data.forEach((item: any) => {
    item.lngLat = CoordTransform.GCJ02ToWGS84(item.location.lng, item.location.lat);
    item.title = item.city + item.title;
  });
  return data;
};

// 雪亮工程聚合处理(临时)
const clusterData = (regionType, resData) => {
  const regionPoints = regionType.reduce((pre, item) => {
    const list = resData.filter((i) => parseFloat(i.longitude) && parseFloat(i.latitude) && i.regionPathName.includes(`${item}/`));
    pre.set(item, list);
    return pre;
  }, new Map());
  const parentMarkerObj = window.viewer.entities.getOrCreateEntity('雪亮工程');
  parentMarkerObj.show = true;
  regionPoints.forEach((regionPoints, regionName) => {
    constructClusterPoint(regionName, regionPoints);
    // 构建区划点位总览label
    const src = mapAreaMidPoint.filter((area) => area.name === regionName)[0];
    src.length = regionPoints.length;
    const { lng, lat } = src;
    window.viewer.entities.add({
      id: Math.random().toString(),
      src,
      position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
      lng,
      lat,
      itemId: `雪亮工程区域label-${regionName}`,
      parent: parentMarkerObj, //父实体
      billboard: {
        width: 75,
        height: 45,
        image: clusterBG,
        scale: new Cesium.CallbackProperty(() => {
          const pointsLength = `${regionPoints.length}`.length;
          return 0.8 + pointsLength * 0.1;
        }, true),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
      label: {
        text: `${regionPoints.length || 0}`,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
        pixelOffset: new Cesium.CallbackProperty(() => {
          const pointsLength = `${regionPoints.length}`.length;
          return new Cesium.Cartesian2(0, -(21 + pointsLength * 1));
        }, true),
        disableDepthTestDistance: 1000,
        eyeOffset: new Cesium.Cartesian3(0, 0, -10),
      },
    });
  });
};

const constructClusterPoint = (regionName, regionPoints) => {
  const clusterDataSource = new Cesium.CustomDataSource(`clusterDataSource_${regionName}`);
  clusterDataSourceList.push(clusterDataSource);
  const image = '/staticRecourse/mapRecourse/marker/视频监控/视频监控.png';
  regionPoints.forEach((point) => {
    const entity = {
      pointType: '雪亮工程',
      src: point,
      lng: point.lng || null,
      lat: point.lat || null,
      id: Math.random().toString(),
      show: true,
      position: Cesium.Cartesian3.fromDegrees(parseFloat(point.longitude), parseFloat(point.latitude), 0),
      billboard: {
        image,
        width: 22,
        height: 27,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.MAX_VALUE,
        scale: 1.0,
      },
    };
    clusterDataSource.entities.add(entity);
  });

  window.viewer.dataSources.add(clusterDataSource).then((dataSource) => {
    dataSource.clustering.enabled = true; //是否聚合
    dataSource.clustering.pixelRange = 30; //聚合范围（单位px）
    dataSource.clustering.minimumClusterSize = 10; //最小屏幕聚合对象数值（小于等于该数值，不聚合）
  });
  const changeFontSize = (length, cluster) => {
    if (length > 99) {
      cluster.label.pixelOffset = new Cesium.Cartesian2(0, -13);
      cluster.billboard.scale = 1.1;
    } else if (length > 999) {
      cluster.label.pixelOffset = new Cesium.Cartesian2(0, -14);
      cluster.billboard.scale = 1.2;
    } else if (length > 9999) {
      cluster.label.pixelOffset = new Cesium.Cartesian2(0, -15);
      cluster.billboard.scale = 1.3;
    }
  };
  clusterDataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
    cluster.label.show = true;
    cluster.label.eyeOffset = new Cesium.Cartesian3(0, 0, -10);
    cluster.label.pixelOffset = new Cesium.Cartesian2(0, -12);
    cluster.label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
    cluster.label.outlineColor = Cesium.Color.WHITE;
    cluster.label.outlineWidth = 1;

    cluster.billboard.width = 75;
    cluster.billboard.height = 45;
    cluster.billboard.show = true;
    cluster.billboard.id = cluster.label.id;
    cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

    if (clusteredEntities.length >= 10) {
      cluster.label.text = `${clusteredEntities.length}`;
      cluster.billboard.image = clusterBG;
      changeFontSize(clusteredEntities.length, cluster);
    }
  });
};

const removeClusterDataSource = () => {
  clusterDataSourceList.forEach((s) => {
    s.show = false;
  });
};

const xueLiangEvent = () => {
  //获取当前相机高度
  let height = Math.ceil(window.viewer.camera.positionCartographic.height);
  const heightToZoom = (height: number) => {
    var A = 40487.57;
    var B = 0.00007096758;
    var C = 91610.74;
    var D = -40467.74;
    return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)));
  };
  let zoom = heightToZoom(height);
  const layer = window.viewer.entities.getById('雪亮工程'); //选中的图层
  if (zoom > 12) {
    clusterDataSourceList.forEach((s) => {
      s.show = true;
    });
    layer.show = false;
  } else {
    clusterDataSourceList.forEach((s) => {
      s.show = false;
    });
    layer.show = true;
  }
};
