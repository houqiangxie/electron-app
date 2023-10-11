/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-23 18:09:16
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-06-07 15:13:50
 */
// 获取cesium地图层级
const Cesium = window.Cesium;
const getZoomLevel=(viewer:any): number => {
     var tiles = [];
 var tilesToRender = viewer.scene.globe._surface._tilesToRender;
 if (Cesium.defined(tilesToRender)) {
    for (var j = 0, len = tilesToRender.length; j < len; j++) {
     tiles.push(tilesToRender[j].level);
    }
 }
 return Math.min.apply(tiles[0], tiles);
}

 // 获取当前地图中心的经纬度
const getCenterPosition = (viewer: any) => {
    let centerResult = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(
            viewer.canvas.clientWidth / 2,
            viewer.canvas.clientHeight / 2,
        ),
    )
    let curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerResult);
    let curLongitude = (curPosition.longitude * 180) / Math.PI;
    let curLatitude = (curPosition.latitude * 180) / Math.PI;
    return {
        lon: curLongitude,
        lat: curLatitude,
    }
}

/**
 * @description: 获取当前可视矩形范围
 * @param {*} _viewer
 * @return {*}
 */
const refreshViewRectangle =(_viewer: any)=> {
    let rectangle = _viewer.camera.computeViewRectangle();
    console.log("当前可视范围矩形为：");
    console.log(rectangle);
}

// // 添加相机监听事件
// viewer.camera.moveEnd.addEventListener(() => {
//     refreshViewRectangle(viewer);
// })








export { getZoomLevel, getCenterPosition, refreshViewRectangle };