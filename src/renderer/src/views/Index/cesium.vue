<!--
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2023-04-19 20:33:26
 * @LastEditors: houqiangxie
 * @LastEditTime: 2023-05-24 16:48:46
-->
<template>
    <div id="map3d" class="w-full h-full">
        
    </div>
</template>

<script setup lang="ts">
import BaiduImageryProvider from '@/utils/providers/BaiduImageryProvider';
import addMarker from '@/utils/map/cesium3d.mjs'

//加载geojson，
const files = import.meta.glob("/src/assets/jdb/*.json",{eager:true});
console.log('files: ', files);
const mapJson = {}; // 轮廓线数据
Object.keys(files).forEach((key) => {
    const name = key.replace(/\/src\/src\/jdb\/|.json/g, '');
  mapJson[name] = files[key].default || files[key];
});
console.log('mapJson: ', mapJson);
const loadMap = async() => {
    // Cesium.Ion.defaultAccessToken =
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNTFlNWVmMC1jOWRhLTQyMDktOTY4Ny02YTU5YWFlMGYwY2IiLCJpZCI6OTQzNDQsImlhdCI6MTY1Mjg4ODEyNn0.g2vq1qq_rdfZeRTy73nBkEDzhMIM4upkYcbIdFYnCiQ";

    window.viewer = new Cesium.Viewer('map3d', {
        baseLayerPicker: false, // 如果设置为false，将不会创建右上角图层按钮。
        geocoder: false, // 如果设置为false，将不会创建右上角查询(放大镜)按钮。
        navigationHelpButton: false, // 如果设置为false，则不会创建右上角帮助(问号)按钮。
        homeButton: false, // 如果设置为false，将不会创建右上角主页(房子)按钮。
        sceneModePicker: false, // 如果设置为false，将不会创建右上角投影方式控件(显示二三维切换按钮)。
        animation: false, // 如果设置为false，将不会创建左下角动画小部件。
        timeline: false, // 如果设置为false，则不会创建正下方时间轴小部件。
        fullscreenButton: false, // 如果设置为false，将不会创建右下角全屏按钮。
        scene3DOnly: false, // 为 true 时，每个几何实例将仅以3D渲染以节省GPU内存。
        shouldAnimate: true, // 默认true ，否则为 false 。此选项优先于设置 Viewer＃clockViewModel 。
        // ps. Viewer＃clockViewModel 是用于控制当前时间的时钟视图模型。我们这里用不到时钟，就把shouldAnimate设为false
        infoBox: false, // 是否显示点击要素之后显示的信息
        sceneMode: 3, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  this.Cesium.SceneMode
        requestRenderMode: false, // 启用请求渲染模式，不需要渲染，节约资源吧
        imageryProvider: new BaiduImageryProvider({
            url: 'https://maponline1.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=&from=jsapi2_0',
            crs: 'WGS84',
            layer: `layer`,
            style: 'default',

        }),
        selectionIndicator: false, // 关闭绿色选择框
    })
    // window.viewer._cesiumWidget._creditContainer.style.display = 'none' //去除cesium按钮
    // window.viewer.scene.globe.depthTestAgainstTerrain = true



    // var highlightedEntity;
    // var highlightColor = Cesium.Color.GREEN.withAlpha(0.6);
    // var normalColor = Cesium.Color.YELLOW.withAlpha(0.6);

    // //一种属性，如果实体当前被鼠标悬停，则返回高亮显示颜色，否则返回默认颜色.
    // function createCallback(entity) {
    //     var colorProperty = new Cesium.CallbackProperty(function (time, result) {
    //         if (highlightedEntity === entity) {
    //             return Cesium.Color.clone(highlightColor, result);
    //         }
    //         return Cesium.Color.clone(normalColor, result);
    //     }, false);

    //     return new Cesium.ColorMaterialProperty(colorProperty);
    // }

    // let dataSource =null
    // for (const [key, json] of Object.entries(mapJson)) {
    //      dataSource = await Cesium.GeoJsonDataSource.load(json,{
    //          stroke: Cesium.Color.HOTPINK,
    //         fill: Cesium.Color.PINK.withAlpha(0.2),
    //          strokeWidth: 5,
    //     })
    //     // 放入场景中
    //     window.viewer.dataSources.add(dataSource);
    //     // // 统一修改样式
    //     const entities = dataSource.entities.values;
    //     entities.forEach((entity) => {
    //         entity.polygon.material = createCallback(entity);
    //     //   entity.polygon.material = Cesium.Color.fromCssColorString('#ff0000');
    //     //   entity.polygon.outline = false;
    //         // 行政区域边界线加粗
    //         //   const positions = entity.polygon.hierarchy._value.positions;
    //         //   entity.polyline = {
    //         //     positions,
    //         //     width: 10,
    //         //     material: Cesium.Color.RED,
    //         //     // clampToGround: true,
    //         //   };
    //         //   entity.polygon = {
    //         //     positions,
    //         //     material: Cesium.Color.fromCssColorString('#ff0000'),
    //         //     // clampToGround: true,
    //         //     };
    //         //   flyEntity= entity
    //     });
    // window.viewer.zoomTo(dataSource)
    // }
    // var scene = window.viewer.scene;
    // var handler = viewer.screenSpaceEventHandler;
    // handler.setInputAction(function (movement) {
    //     var pickedObject = scene.pick(movement.endPosition);
    //     if (Cesium.defined(pickedObject) && pickedObject.id instanceof Cesium.Entity) {
    //         highlightedEntity = pickedObject.id;
    //     } else {
    //         highlightedEntity = undefined;
    //     }

    // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // let positions = Cesium.Cartesian3.fromDegreesArrayHeights([108, 32, 10, 109, 32, 10]);
    let list = {
        list: [{ lng: 114.1135659351782, lat: 22.602362676248773 }, { lng: 114.114359351782, lat: 22.6042676248773 }],
        name: '视频'
    }
    addMarker.add(list)
    // window.viewer.entities.add({
    //     polyline: {
    //         positions: positions,
    //         width: 2,
    //         material: new window.xt3d.PolylineObject.PolylineTrailMaterialProperty({
    //             speed: 4 * Math.random(),
    //             color: Cesium.Color.YELLOW,
    //             percent: 0.5,
    //             gradient: 0.01,
    //         })
    //     }
    // });
}

onMounted(() => {
    loadMap()
})
</script>