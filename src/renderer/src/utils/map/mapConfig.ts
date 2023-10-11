import AmapMercatorTilingScheme from '@/utils/providers/AmapMercatorTilingScheme';
import clusterBackground from '@/assets/images/mapIcon/clusterBG.png';
// const tiandituToken_env: string = import.meta.env.VITE_TIANDITUTOKE;
const tiandituToken: string = '1518ed2cee89372f7a49a66fed009e8e';
export const tencentKey: string = 'BUPBZ-X5BWU-LW6VQ-4Z2ZP-XGGW2-5AFQM';

// const tiandituToken = new Map([
//   ['172.17.13.108','a6bfc86e57167f056bb2ffe005e6bf7e'],
//   ['172.17.136.54','d3828c8f2899ee7fe246d1181c3793e5'],
//   ['121.35.9.106','2e6ad2e589f7d84a79dd279540b70c2e'],
//   ['localhost','258a551ebb6add24b2f9b4e907ff0aa0']
// ]).get(window.location.hostname) || 'a6bfc86e57167f056bb2ffe005e6bf7e'

export const mapCenter = [114.204641, 22.341084];

// 因后台没返回经纬度，所以将地图这边的经纬度先存储过来，再去给到这些图层
export const mapCode = new Map([
  ['水库', 'code'],
  ['河道', 'hdbm'],
  ['给水厂', 'fd_coding'],
  ['给水泵站', 'fd_coding'],
]);
export const mapAreaMidPoint = [
  {
    name: '宝安区',
    lng: 113.84719848632812,
    lat: 22.655205185169194,
  },
  {
    name: '大鹏区',
    lng: 114.47067260742188,
    lat: 22.607672192309476,
  },
  {
    name: '福田区',
    lng: 114.05044555664062,
    lat: 22.545537663981865,
  },
  {
    name: '光明区',
    lng: 113.92890930175781,
    lat: 22.76541831691859,
  },
  {
    name: '龙岗区',
    lng: 114.22554016113281,
    lat: 22.679915840712695,
  },
  {
    name: '龙华区',
    lng: 114.02778625488281,
    lat: 22.688785246513845,
  },
  {
    name: '罗湖区',
    lng: 114.15069580078125,
    lat: 22.567097714644586,
  },
  {
    name: '南山区',
    lng: 113.95774841308594,
    lat: 22.56773178276118,
  },
  {
    name: '坪山区',
    lng: 114.36904907226562,
    lat: 22.685617667466317,
  },
  {
    name: '盐田区',
    lng: 114.27154541015625,
    lat: 22.596261828733894,
  },
  {
    name: '深汕合作区',
    lng: 115.04470825195312,
    lat: 22.873011961866705,
  },
];

// 不同数据集对应url
export const iServerUrl = {
  GD_SZ_YWSJ: 'data-GD_SZ_YWSJ',
  newYWSJ: 'data-GD_SZ_YWSJ',
  GD_SZ_YWSJ_1006: 'data-GD_SZ_YWSJ_1006',
  sf: 'data-GD_SZ_2021_Q1_SZSF',
  GD_SZ_YWSJ_PingShanYD: 'data-GD_SZ_YWSJ_PingShanYD',
};

export const mvtUrl = new Map([
  ['map-mvt-GDSZYWSJQP1025', 'GD_SZ_YWSJ_QP1203'],
  ['map-mvt-GDSZYWSJSEWAGE2', 'GD_SZ_YWSJ_SEWAGE2'],
  ['map-mvt-GDSZYWSJPIPE', 'GD_SZ_YWSJ_PIPE'],
  ['map-mvt-GDSZ2021Q4SZROAD', 'GD_SZ_2021_Q4_SZROAD'],
]);

export const clusterBG = clusterBackground;

// 图层弹窗ids
export const gisTagIds = [
  11010, 11504, 11505, 11503, 11105, 11106, 11519, 11521, 11522, 11523, 11520, 11517, 11516, 11514, 11513, 11515, 11107, 11108, 11109, 11110, 101,
  11112, 11508, 11510, 11512, 11507, 11506, 11518, 11511, 11509, 11115, 11113, 11114, 66,
];
// 无需上图图层tagId
export const notMarkerList = ['220000103', '220000104'];

export const cesiumConfig = {
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  baseLayerPicker: false,
  navigationHelpButton: false,
  animation: false,
  timeline: false,
  fullscreenButton: false,
  vrButton: false,
  selectionIndicator: false,
  // requestRenderMode: true, //启用请求渲染模式
  // useBrowserRecommendedResolution: false, // 是否选择浏览器推荐分辨率
  maximumRenderTimeChange: Infinity, // 无操作时自动渲染帧率，设为数字会消耗性能，Infinity为无操作不渲染
  shadows: false, // 是否显示光照投射的阴影
  targetFrameRate: 10, // 帧率
  shouldAnimate: false,
  // navigation: false,
  cesiumLogo: false,
  sceneMode: Cesium.SceneMode.SCENE3D,
  terrainExaggeration: 3,
  infoBox: false,
  contextOptions: {
    webgl: {
      alpha: true,
      depth: true,
      stencil: true,
      antialias: true,
      premultipliedAlpha: true,
      //通过canvas.toDataURL()实现截图需要将该项设置为true
      preserveDrawingBuffer: true,
      failIfMajorPerformanceCaveat: true,
    },
  },
  defaultAccessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZmM4MWYwYS0xOWM3LTQ0ZWEtYTUzNC1mMWI3ODAyODA1ZmYiLCJpZCI6NDQ2OTEsImlhdCI6MTYxNDI0NDk1OX0.5wce5JelLgCOVQ513YI9QtLDuqTA_L9Y0u_s2oFkWR4',
};
// 地图图层配置
export const mapProviderConfig = {
  1: {
    url: [
      `https://{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图影像图
      // `https://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图标注
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
    },
  },
  2: {
    url: [
      `https://{s}.tianditu.gov.cn/vec_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图矢量图
      `https://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图标注
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
    },
  },
  3: {
    // 3维地图
    url: [
      `https://{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图影像图
      `https://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图标注
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
    },
  },
  4: {
    url: [
      'https://maponline1.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=&from=jsapi2_0', // 百度地图矢量图
      // 'http://ss1.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&udt=20180810&scaler=1&showtext=1', // 百度地图影像图
      // 'https://maponline1.bdimg.com/pvd/?qt=vtile&param=9BA%3BE8FKD%3EP%3BO86J5B%3BEL9FJE6%3BEE%40CNHJK%3DE9GJ8J%3BEF%3EGN9%3AL%3D%3F%3ENPE4%3BEE%3E%3FBHJK%3DD9FK4%3EOCO82N5B%3BEG%3ECL5L%3ECB8%3AJE2%403B8%3EE8FNMA%3FJPE22'
      // 'https://map.baidu.com/?newmap=1&qt=image&type=1&auth=WaV7aMdMF8xNyCxR66810BJ%40V4yJw0IXuxLzRENRBEBtxZhQxjh%40wWvvYgP1PcGCgYvjPuVtvYgPMGvgWv%40uVtvYgPPxRYuVtvYgP%40vYZcvWPCuVtcvY1SGpuLtBalTecThTTAZzvYgPhPPyheuVtvhgMuxVVty1uVtCGYuVt1GgvPUDZYOYIZuVt1cv3uVtGccZcuVtPWv3Guxt58Jv7uPYIUvhgMZSguxzBEHLNRTVtcEWe1GD8zv7u%40ZPuVtc3CuVteuVtegvcguxLzRENRBzNtkoPPB9ArZZWux&seckey=cde6ebb241c3d75c675c8688828640edba33c570fc006f6ccdee864f2e95d88033fc19e794fee19c2417a6953ba260f3e91efa7e82cbc9c45b5854aec79ce92444084081ad0f3551192919ed16268a52c324a915487fecb65366e213798abda700a4b8f3d5e7729fc0133c92f5f35965686b5b8829d8807c5cd1bdcf620b0af326963c326a655cd48906c867c3d31093acf03e6974e448a42cc0ffc1ce254fe2d29d73de3001fe73d3d5cae7fde2c053eab720b289b1794e7318e0e5c17a6b4df0e31e9ee9bb1cd11d672e101aa7154db8f338b39e58ba5b37822b58981f33c461673fbeaf326f007a05d16a8c3e3aa0'
    ],
    type: '',
    options: { crs: 'WGS84' },
  },
  5: {
    url: [
      `https://{s}.tianditu.gov.cn/vec_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图矢量图
      `https://{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图影像图
      `https://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图标注
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
    },
  },
  6: {
    url: [
      'https://map.szsti.org:8090/iserver/services/map-ugcv5-GDSZ2020Q44326/rest/maps/GD_SZ_2020_Q4%284326%29', //电子地图
    ],
    type: 'SuperMapImageryProvider',
    options: {},
  },
  7: {
    url: [
      `https://{s}.tianditu.gov.cn/ter_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=ter&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图地形图
      // `https://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图标注
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
    },
  },
  8: {
    url: [
      'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', // 高德地图矢量图
      // "https://wprd02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11", // 高德地图路网图
    ],
    type: 'UrlTemplateImageryProvider',
    options: {
      subdomains: ['01', '02', '03', '04'],
      minimumLevel: 3,
      maximumLevel: 18,
      tilingScheme: new AmapMercatorTilingScheme(),
    },
  },
  9: {
    // 实时路况图
    url: [
      // "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}", // 高德地图影像图
      // "https://wprd02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11", // 高德地图路网图
      'https://rtt2b.map.qq.com/rtt/?z={z}&x={x}&y={reverseY}&times=2&time=1631504424185', //实时路况图
    ],
    type: 'UrlTemplateImageryProvider',
    options: {
      tilingScheme: new AmapMercatorTilingScheme(),
    },
  },
  10: {
    url: [
      'https://map.szsti.org:8090/iserver/services/map-ugcv5-GDSZ2020Q4SF/rest/maps/GD_SZ_2020_Q4_SF', // 三防地图
    ],
    type: 'SuperMapImageryProvider',
    options: {},
  },
  12: {
    url: [
      // // "https://p2.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=229", // 腾讯地图影像图
      // "https://rt3.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=1&version=297",
      // 'https://rt3.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=3&scene=0',
      // "https://p2.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=244",
      // "https://rt3.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=2&version=859",
      'https://rtt2b.map.qq.com/rtt/?z={z}&x={x}&y={reverseY}&times=2&time=1631504424185',
      // "http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=",
    ],
    type: 'UrlTemplateImageryProvider',
    options: {
      // customTags: {
      //   sx(imageryProvider: any, x: number, y: number, level: number) {
      //     return x >> 4;
      //   },
      //   sy(imageryProvider: any, x: number, y: number, level: number) {
      //     return ((1 << level) - y) >> 4;
      //   },
      // },
    },
  },
  13: {
    // egisditu
    url: [
      new Cesium.Resource({
        // url: this.cesiumUrl,
        url: 'https://yjglzhpt.szsti.org:9090/egis?layer=vec&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}',
        headers: {
          Authorization: 'Basic NWEwNTBkYmYwOGVhNDdhNTlhYzA4NTY5MmM4MDFiMzk6NDIxZGU1ODU0NGQwNDNhMmJlYjUxZDk3ZDJhY2Q3Njg=',
        },
      }),
      `https://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tiandituToken}`, // 天地图标注
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixSetID: 'vec1',
      maximumLevel: 21,
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    },
  },
  14: {
    // 规字局白色
    url: [
      new Cesium.Resource({
        // url: "http://10.253.102.69/gw/OGC/Map/SZ_VEC_W4490/",
        url: 'http://10.253.102.69/gw/OGC/Map/SZ_VEC_W4490_bld3d_2021/',
        headers: {
          'szvsud-license-key': 'iFxsV23NZpCFtIjQSbq9vTt9WkuvGAhyk6JOlQc+/Ve8eJyvEr5JAxod8Sh+gF6B',
        },
      }),
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      rectangle: Cesium.Rectangle.fromDegrees(113.752587, 22.395764, 114.666702, 22.864379),
      layer: 'w_shenzhen3d_2021',
      style: 'polygon',
      format: 'image/png',
      service: 'WMS',
      tileMatrixSetID: 'EPSG:4490',
      // maximumLevel: 10,
      // minimumLevel: 5,
      tileMatrixLabels: [
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:1',
        'EPSG:4490:2',
        'EPSG:4490:3',
        'EPSG:4490:4',
        'EPSG:4490:5',
        'EPSG:4490:6',
        'EPSG:4490:7',
        'EPSG:4490:8',
        'EPSG:4490:9',
        'EPSG:4490:10',
        'EPSG:4490:10',
        'EPSG:4490:10',
      ],
      tilingScheme: new Cesium.GeographicTilingScheme(),
    },
  },
  15: {
    // 规字局蓝色
    url: [
      new Cesium.Resource({
        url: 'http://10.253.102.69/gw/OGC/Map/SZ_VEC_B4490/',
        headers: {
          'szvsud-license-key': 'cUI8atebuD6+F/nSLS8aBFuiE/nFhWU0oSVInqPRVJf8tKJbd/PTHaSVEd4bFuuy',
        },
      }),
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      rectangle: Cesium.Rectangle.fromDegrees(113.752587, 22.395764, 114.666702, 22.864379),
      layer: 'Blue_shenzhen',
      style: 'polygon',
      format: 'image/png',
      service: 'WMS',
      tileMatrixSetID: 'EPSG:4490',
      // maximumLevel: 10,
      // minimumLevel: 5,
      tileMatrixLabels: [
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:0',
        'EPSG:4490:1',
        'EPSG:4490:2',
        'EPSG:4490:3',
        'EPSG:4490:4',
        'EPSG:4490:5',
        'EPSG:4490:6',
        'EPSG:4490:7',
        'EPSG:4490:8',
        'EPSG:4490:9',
        'EPSG:4490:10',
        'EPSG:4490:10',
        'EPSG:4490:10',
      ],
      tilingScheme: new Cesium.GeographicTilingScheme(),
    },
  },
  16: {
    // 顺丰地图
    url: [
      'https://jcyjzh.szius.com:11080/sf/MapTileService/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=default&STORETYPE=merged-dat&LAYER=wmts_4326_440300&PROJECTION=4326&TILEMATRIXSET=c&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&FORMAT=image/png',
    ],
    type: 'WebMapTileServiceImageryProvider',
    options: {
      tilingScheme: new Cesium.GeographicTilingScheme(),
      layer: 'img_C13',
      style: 'default',
      tileMatrixSetID: 'img_C13',
      maximumLevel: 21,
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
      // tilingScheme: new Cesium.GeographicTilingScheme(),
    },
  },
  17: {
    // 归字局影像
    url: [
      new Cesium.Resource({
        url: 'http://10.253.102.69/gw/OGC/Map/SZ_IMG_2020/{z}/{x}/{y}',
        headers: {
          'szvsud-license-key': 'iFxsV23NZpCFtIjQSbq9vTt9WkuvGAhyk6JOlQc+/Ve8eJyvEr5JAxod8Sh+gF6B',
        },
      }),
      // new Cesium.Resource({
      //   url: 'http://10.253.102.69/gw/OGC/Map/SZ_IMG_2021/wms130',
      //   headers: {
      //     'szvsud-license-key': 'iFxsV23NZpCFtIjQSbq9vTt9WkuvGAhyk6JOlQc+/Ve8eJyvEr5JAxod8Sh+gF6B',
      //   },
      // }),
    ],
    type: 'UrlTemplateImageryProvider',
    options: {},
  },
  18: {
    url: [
      'https://map.szsti.org:8090/iserver/services/map-GD_SZ_YWSJ_WHP_BLUE/rest/maps/GD_SZ_YWSJ_WHP_BLUE', // 危化地图
    ],
    type: 'SuperMapImageryProvider',
    options: {},
  },
};
