/* 使用
import addMarker from '@/utils/map/addMarker.js'
let list = {
  list:[{lng:114.1135659351782, lat:22.602362676248773},{lng:114.114359351782, lat:22.6042676248773}],
  name:'视频'
}
addMarker.add(list)

// 直线
addMarker.add({ list:[[[114,22],[113,21]]], type:'polyline', name:'ccc'})

// polygon 遮罩需要添加pointsInset (insetCustom:自定义)
addMarker.polygonFn({list:[{points:[[0, 0],[0, 90],[179, 90],179, 0], pointsInset:[[positionArray]]}], config:{}, name:'反遮罩'})
setTimeout(()=>{
  addMarker.del('反遮罩')
},3000)
*/
import pointDefaultIcon from '/images/marker/point.png';
import {db} from 'ux-web-storage'
class AddMarker {
  // constructor({ list=[], type='billbord', name='default'}){
  //   // this.list = [{lng:114.131,lat:22.12}]
  //   this.list = list
  //   this.type = type
  //   this.map = new Map()
  //   this.init()
  // }
  static add({ list=[], type='billbord', name='default', icon=pointDefaultIcon, config, nodetail=false}){
    if(type === 'polygon'){
      return AddMarker.polygonFn({list, name, config, nodetail})
    }
    let markerType =null
    switch(type){
      case 'polyline': markerType = new Cesium.PolylineCollection(); break;
      default: markerType = new Cesium.BillboardCollection(); break;
    }
    let layers = window.viewer.scene.primitives.add(markerType);
    const listData = {}
    list.filter(({ lng, lat }) => (lng && lat) || type=='polyline').map(o => {
      const id = o.primiseId || `${name}->${o.id || Math.random()}`
      const position = type=='polyline' ? { 
          positions: o.map(_ => Cesium.Cartesian3.fromDegrees(_[0], _[1])),
          width:3,
          material:  Cesium.Material.fromType('Color', {
              color : Cesium.Color.fromCssColorString(config.color || 'red')
          }), 
          // classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, // 贴地
          // positions: [Cesium.Cartesian3.fromDegrees(114,22,0), Cesium.Cartesian3.fromDegrees(114.5,22.9,0)],
        } : { 
          position: Cesium.Cartesian3.fromDegrees(o.lng, o.lat),
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          // disableDepthTestDistance: Number.MAX_VALUE,
        }

        // merge(o,{ nodetail, primiseId:id, detailTitles: name },config);
      o.primiseId = id
      o.detailTitles = name
      o.nodetail = nodetail
      Object.assign(o,config)
      const layer = layers.add({
        id,
        labelTranslate: o,
        ...position,
        // position: Cesium.Cartesian3.fromDegrees(o.lng, o.lat),
        image: o.icon || icon,
        ...config,
        ...o.config
      })
      listData[id] = o
    })
    db.set(name, {layers, data: listData})
    return {layers, data: listData}
  }
  // 多边形
  static polygonFn({list=[], name='default', config={}, nodetail=false}){ // list=[{points:[[lng,lat],[lng,lat]], pointsInset:[[[lng,lat],[lng,lat]]]}]
    const listData = {},layers={}
    list.filter(({points }) => points).map(o => {
      const id = o.primiseId || `${name}->${o.id || Math.random()}`
      const polygonWithHole = new Cesium.PolygonGeometry({
        polygonHierarchy : new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(o.points.flat(Infinity)),
          o.pointsInset ? (o.insetCustom ? o.pointsInset : [new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray( o.pointsInset.flat(Infinity)))]) : []
        )
      });
      const entity = window.viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            id,
            geometry: polygonWithHole
          }),
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false,
            material: Cesium.Material.fromType('Color', {
              color : Cesium.Color.fromCssColorString(config.color||'yellow').withAlpha(config.alpha||1)
            }), 
          })
        })
      );
      Object.assign(o,config);
      listData[id] = o
      layers[id] = entity
    })
    db.set(name, {polygons:layers, data: listData})
  }
  
  static selected(data = {},config = {}){
    const {lng, lat, layerName,aliasName} = data;
    const layerNamenow = aliasName || layerName + '选中'; // 选中放大图标
      if(lng && lat ){
        AddMarker.del(layerNamenow);
        AddMarker.add({ list: [data], name: layerNamenow,nodetail: true, config: {scale:1.3, width:38, height:40, disableDepthTestDistance: Number.MAX_VALUE,...config} })
      }
      return layerNamenow
  }
  
  static async get(names='', isData=false){
    if(!names || typeof names !== 'string') return;
    const [name, id] = names.split('->')
    let res =await db.get(name)
    if(res){
      let curdata = res.data?.[names]
      if(isData){
        let cur =  res?.layers._billboards.find(o=>o.id === names)
        res = { layer:cur, data: curdata}
      }else{
        if(id) res = curdata
      }
    }else {
      res = null
    }
    return res ;
  }

  static async del(names=''){
    if(!names) return;
    const [name, id] = names.split('->')
    let res = await db.get(name)
    if(id){
      let cur =  res?.layers._billboards.find(o=>o.id === names)
      if(cur) {
        cur._destroy()
        delete res.data.names
      }
    }else{
      res?.layers && res.layers.removeAll() // res.layers.destroy(); // 更新版本bug
      if(res?.polygons){
        for(let key = Object.keys(res.polygons).length-1; key>=0; key--){
          let curP  = Object.values(res.polygons)[key]
          // !curP?.isDestroyed?.() && curP.destroy?.()
          window.viewer.scene.primitives.remove(curP)
        }
      }
      db.delete(name)
    }
  }

  static async show(name='', isShow){
    if(!name) return;
    let res = await db.get(name)
    res?.layers && (res.layers.show = isShow);
    res?.layers?._billboards?.map?.(o => o.show = isShow); // 兼容
  }
}
export default AddMarker

