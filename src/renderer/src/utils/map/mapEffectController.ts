import * as turf from '@turf/turf';

const routeStyleMap = new Map([
  ['救援', { color: '#eb4242', image: 'redRoadArrow' }],
  ['疏散-黑', { color: '#62d9ad', image: 'greenRoadArrow' }],
  ['疏散-白', { color: '#21a4f7', image: 'blueRoadArrow' }],
]);
class MapEffectController {
  constructor() {
    this.pointSpreadEffectList = new Map();
    this.layerList = {};
    this.lastPointSpreadEffect = null;
  }

  // 添加临时点位及扩散效果
  addPointSpreadEffect({
    lng,
    lat,
    radius = 5000,
    point = {},
    isShowPoint = true,
    isShowConvergenceCircleEffect = true,
    isShowSpreadEffect = false,
    duration = 15,
    isUnique = true,
  }) {
    if (isUnique && this.lastPointSpreadEffect) this.removeMapEffect(this.lastPointSpreadEffect.id);
    if (!lng || !lat) return;
    const mapEffectObj = {
      id: this._getId('point'),
      lng,
      lat,
      point,
      radius,
      mapEffect: {},
    };
    // 添加点位图标
    if (isShowPoint) mapEffectObj.mapEffect.icon = this._addIcon(mapEffectObj);
    // 添加收敛圆
    if (isShowConvergenceCircleEffect) mapEffectObj.mapEffect.convergenceCircleEffect = this._addConvergenceCircleEffect(mapEffectObj);
    // 添加外发光扩散圆
    if (isShowSpreadEffect) mapEffectObj.mapEffect.spreadEffect = this._addSpreadCircleEffect(mapEffectObj);
    // 添加定时器移除效果
    if (duration)
      mapEffectObj.mapEffectTimer = setTimeout(() => {
        this.removeMapEffect(mapEffectObj.id);
      }, duration * 1000);
    this._addMapEffect(mapEffectObj);
    if (isUnique) this.lastPointSpreadEffect = mapEffectObj;
    return mapEffectObj;
  }

  // 添加移动路线及流动效果
  addLineRouteFlowEffect({ line, type, isShowRoute = true, isShowFlowArrowEffect = true }) {
    const id = this._getId('line');
    const mapEffectObj = {
      id,
      mapEffect: {},
    };
    if (isShowRoute) mapEffectObj.mapEffect.route = this._addRoute(line, type);
    if (isShowFlowArrowEffect) mapEffectObj.mapEffect.flowArrowEffect = this._addFlowArrowEffect(line, type);
    this._addMapEffect(mapEffectObj);
    return mapEffectObj;
  }

  _addMapEffect(mapEffectObj) {
    const { id, point } = mapEffectObj;
    const layerName = point?.layerName || point?.searchPopupName || '其它';
    if (!this.layerList[layerName]) this.layerList[layerName] = [id];
    else this.layerList[layerName].push(id);
    if (this.pointSpreadEffectList.get(id)) this.removeMapEffect(id);
    else this.pointSpreadEffectList.set(id, mapEffectObj);
  }

  removeMapEffect(id) {
    const mapEffectObj = this.pointSpreadEffectList.get(id);
    if (!mapEffectObj) return;
    Object.keys(mapEffectObj.mapEffect).forEach((key) => {
      window.viewer.entities.remove(mapEffectObj.mapEffect[key]);
    });
    this.pointSpreadEffectList.delete(id);
    clearTimeout(mapEffectObj.mapEffectTimer);
  }

  // 添加路线
  _addRoute(line, type) {
    return window.viewer.entities.add({
      name: `${type}路线-路线`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(line.flat()),
        clampToGround: true,
        width: new Cesium.CallbackProperty(() => {
          const cameraHeight = Math.ceil(window.viewer.camera.positionCartographic.height);
          const basicHeight = cameraHeight / 1000;
          return 30 / basicHeight;
        }, false),
        height: 1,
        material: Cesium.Color.fromCssColorString(routeStyleMap.get(type).color).withAlpha(0.36),
      },
    });
  }

  // 添加流动箭头
  _addFlowArrowEffect(line, type) {
    let count = Math.round(turf.length(turf.lineString(line), { units: 'kilometers' }) * 2);
    if (!count) count = 1;
    return window.viewer.entities.add({
      name: `${type}路线-箭头`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(line.flat()),
        clampToGround: true,
        width: new Cesium.CallbackProperty(() => {
          const cameraHeight = Math.ceil(window.viewer.camera.positionCartographic.height);
          const basicHeight = cameraHeight / 1000; // 参考高度为 5
          return 50 / basicHeight;
        }, false),
        height: 1,
        material: new Cesium.TrailLineMaterialProperty({
          image: `/staticRecourse/mapRecourse/image/${routeStyleMap.get(type).image}.png`,
          count,
          duration: 1800,
        }),
      },
    });
  }

  // 添加图标
  _addIcon(mapEffectObj) {
    const { lng, lat, id, point } = mapEffectObj;
    let image;
    if (point.selectIcon) image = point.selectIcon;
    else {
      const groupName = point.groupName || point.layerGroupName || '其它';
      const layerName = point.layerName || point.searchPopupName || 'point';
      image = `/staticRecourse/mapRecourse/marker/${groupName}/${layerName}-选中.png`;
    }
    return window.viewer.entities.add({
      entpName: point.entpName ?? '',
      id: `icon-${id}`,
      name: '点位图标',
      src: { ...point, mapTemporaryPoint: true },
      lng,
      lat,
      position: Cesium.Cartesian3.fromDegrees(lng, lat),
      billboard: {
        image,
        height: 27,
        width: 22,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.MAX_VALUE,
        scale: 1.5,
        pixelOffset: new Cesium.Cartesian2(0, 3),
      },
      detailTitle: point.layerName ?? '',
    });
  }

  // 添加发光收敛圆
  _addConvergenceCircleEffect(mapEffectObj) {
    const { id, lng, lat, radius } = mapEffectObj;
    return window.viewer.entities.add({
      id: `convergenceCircle-${id}`,
      name: '点位提示圈',
      position: Cesium.Cartesian3.fromDegrees(lng, lat),
      ellipse: {
        semiMajorAxis: radius,
        semiMinorAxis: radius,
        material: new Cesium.ScanlineMaterialProperty({
          color: new Cesium.Color.fromCssColorString('red').withAlpha(1),
          speed: 100.0,
        }),
      },
    });
  }

  // 添加外发光扩散圆
  _addSpreadCircleEffect(mapEffectObj) {
    const { id, lng, lat, radius } = mapEffectObj;
    return window.viewer.entities.add({
      id: `spreadCircle-${id}`,
      name: '警戒点',
      position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
      ellipse: {
        semiMinorAxis: radius,
        semiMajorAxis: radius,
        material: new Cesium.CircleDiffusionMaterialProperty({
          duration: 3000,
          gradient: 0,
          color: new Cesium.Color.fromCssColorString('red'),
          count: 3,
        }),
      },
    });
  }

  _getId(type) {
    return `${type}-${Math.random().toString()}`;
  }
}

export default new MapEffectController();
