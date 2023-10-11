/*
 * @Description: 动态扩散墙的墙体效果（参考开源代码）（不同高度透明度不同）
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-07 19:50:46
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-05-30 15:13:59
 */
class WallDiffuseMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this.color = options.color;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType(time) {
    return Cesium.Material.WallDiffuseMaterialType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }

    result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
    return result;
  }

  equals(other) {
    return this === other || (other instanceof WallDiffuseMaterialProperty && Cesium.Property.equals(this._color, other._color));
  }
}

Object.defineProperties(WallDiffuseMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
});

Cesium.WallDiffuseMaterialProperty = WallDiffuseMaterialProperty;
Cesium.Material.WallDiffuseMaterialProperty = 'WallDiffuseMaterialProperty';
Cesium.Material.WallDiffuseMaterialType = 'WallDiffuseMaterialType';
Cesium.Material.WallDiffuseMaterialSource = `
    uniform vec4 color;
    czm_material czm_getMaterial(czm_materialInput materialInput){
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    material.diffuse = color.rgb * 2.0;
    material.alpha = color.a * (1.0 - fract(st.t)) * 0.8;
    return material;
    }
                                            
    `;

Cesium.Material._materialCache.addMaterial(Cesium.Material.WallDiffuseMaterialType, {
  fabric: {
    type: Cesium.Material.WallDiffuseMaterialType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
    },
    source: Cesium.Material.WallDiffuseMaterialSource,
  },
  translucent: function (material) {
    return true;
  },
});

/*
 * @Description: 飞线效果（参考开源代码）
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-05 16:13:21
 * @LastEditors: Julian
 * @LastEditTime: 2022-03-05 17:39:38
 */
class LineFlowMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._speed = undefined;
    this._percent = undefined;
    this._gradient = undefined;
    this.color = options.color;
    this.speed = options.speed;
    this.percent = options.percent;
    this.gradient = options.gradient;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType(time) {
    return Cesium.Material.LineFlowMaterialType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }

    result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
    result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
    result.percent = Cesium.Property.getValueOrDefault(this._percent, time, 0.1, result.percent);
    result.gradient = Cesium.Property.getValueOrDefault(this._gradient, time, 0.01, result.gradient);
    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof LineFlowMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed) &&
        Cesium.Property.equals(this._percent, other._percent) &&
        Cesium.Property.equals(this._gradient, other._gradient))
    );
  }
}

// 自定义材质 流动线条
function CustomMaterialLine(options) {
  var Color = Cesium.Color,
    defaultValue = Cesium.defaultValue,
    defined = Cesium.defined,
    defineProperties = Object.defineProperties,
    Event = Cesium.Event,
    createPropertyDescriptor = Cesium.createPropertyDescriptor,
    Property = Cesium.Property,
    Material = Cesium.Material,
    defaultColor = Color.WHITE,
    MaterialType = options.MaterialType || 'wallType' + parseInt(Math.random() * 1000);
  // 创建自定义动态材质对象
  function PolylineCustomMaterialProperty(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    // 定义内置属性
    this._definitionChanged = new Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color || Cesium.Color.BLUE;
    this.duration = options.duration || 1000;
    this._time = undefined;
  }
  // 定义材质对象默认属性
  defineProperties(PolylineCustomMaterialProperty.prototype, {
    isvarant: {
      get: function () {
        return false;
      },
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      },
    },
    color: createPropertyDescriptor('color'),
  });
  // 材质对象需要有type函数 value函数 equals函数
  PolylineCustomMaterialProperty.prototype.getType = function (time) {
    return MaterialType;
  };
  PolylineCustomMaterialProperty.prototype.getValue = function (time, result) {
    if (!defined(result)) {
      result = {};
    }
    result.color = Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);
    result.image = options.image;
    if (this._time === undefined) {
      this._time = time.secondsOfDay;
    }
    result.time = ((time.secondsOfDay - this._time) * 1000) / this.duration;
    return result;
  };
  PolylineCustomMaterialProperty.prototype.equals = function (other) {
    return (
      this === other || //
      (other instanceof PolylineCustomMaterialProperty && Property.equals(this._color, other._color))
    );
  };
  // 将定义的材质对象添加到cesium的材质队列中
  Material._materialCache.addMaterial(MaterialType, {
    fabric: {
      type: MaterialType,
      uniforms: {
        color: options.color || new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        image: options.image,
        time: options.color.time || 0,
      },
      // 动态材质shader
      source:
        'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                {\n\
                    czm_material material = czm_getDefaultMaterial(materialInput);\n\
                    vec2 st = materialInput.st;\n\
                    \n\
                    if(texture2D(image, vec2(0.0, 0.0)).a == 1.0){\n\
                        discard;\n\
                    }else{\n\
                        material.alpha = texture2D(image, vec2(1.0 - fract(time - st.s), st.t)).a * color.a;\n\
                    }\n\
                    \n\
                    material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb);\n\
                    \n\
                    return material;\n\
                }\n\
                ',
    },
    // 透明
    translucent: function (material) {
      return true;
    },
  });
  return new PolylineCustomMaterialProperty(options);
}

Object.defineProperties(LineFlowMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed'),
  percent: Cesium.createPropertyDescriptor('percent'),
  gradient: Cesium.createPropertyDescriptor('gradient'),
});

Cesium.LineFlowMaterialProperty = LineFlowMaterialProperty;
Cesium.Material.LineFlowMaterialProperty = 'LineFlowMaterialProperty';
Cesium.Material.LineFlowMaterialType = 'LineFlowMaterialType';
Cesium.Material.LineFlowMaterialSource = `
    uniform vec4 color;
    uniform float speed;
    uniform float percent;
    uniform float gradient;
    
    czm_material czm_getMaterial(czm_materialInput materialInput){
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float t =fract(czm_frameNumber * speed / 1000.0);
      t *= (1.0 + percent);
      float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
      alpha += gradient;
      material.diffuse = color.rgb;
      material.alpha = alpha;
      return material;
    }
    `;

Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlowMaterialType, {
  fabric: {
    type: Cesium.Material.LineFlowMaterialType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
      speed: 10.0,
      percent: 0.1,
      gradient: 0.01,
    },
    source: Cesium.Material.LineFlowMaterialSource,
  },
  translucent: function (material) {
    return true;
  },
});

/**
 * @description: 抛物飞线效果初始化
 * @param {*} _viewer
 * @param {*} _num :每条线上的飞线数量
 * @return {*}
 */
function parabolaFlowInit({
  _viewer,
  _num,
  _positions,
  _center = [113.9236839, 22.528061],
  trackWidth = 1,
  lineWidth = 1,
  percent = 0.9,
  speed = 30,
}) {
  _positions = [
    [113.8236839, 22.528061],
    [114.0236839, 22.528061],
    [113.9236839, 22.428061],
    [113.9236839, 22.628061],
    [113.8236839, 22.428061],
    [114.0236839, 22.628061],
    [113.8236839, 22.628061],
    [114.0236839, 22.428061],
  ];
  _positions.forEach((item) => {
    let _siglePositions = parabola(_center, item, 5000);
    // 创建飞线
    for (let i = 0; i < _num; i++) {
      _viewer.entities.add({
        polyline: {
          positions: _siglePositions,
          material: new LineFlowMaterialProperty({
            color: new Cesium.Color(1.0, 1.0, 0.0, 0.8),
            speed: speed * Math.random(),
            percent,
            gradient: 0.01,
          }),
          width: lineWidth,
        },
      });
    }
    // 创建轨迹线
    _viewer.entities.add({
      polyline: {
        positions: _siglePositions,
        material: new Cesium.Color(1.0, 1.0, 0.0, 0.2),
        width: trackWidth,
      },
    });
  });

  /**
   * @description: 抛物线构造函数（参考开源代码）
   * @param {*}
   * @return {*}
   */
  function parabola(startPosition, endPosition, height = 0, count = 50) {
    //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
    let result = [];
    height = Math.max(+height, 100);
    count = Math.max(+count, 50);
    let diffLon = Math.abs(startPosition[0] - endPosition[0]);
    let diffLat = Math.abs(startPosition[1] - endPosition[1]);
    let L = Math.max(diffLon, diffLat);
    let dlt = L / count;
    if (diffLon > diffLat) {
      //base on lon
      let delLat = (endPosition[1] - startPosition[1]) / count;
      if (startPosition[0] - endPosition[0] > 0) {
        dlt = -dlt;
      }
      for (let i = 0; i < count; i++) {
        let h = height - (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) / Math.pow(L, 2);
        let lon = startPosition[0] + dlt * i;
        let lat = startPosition[1] + delLat * i;
        let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
        result.push(point);
      }
    } else {
      //base on lat
      let delLon = (endPosition[0] - startPosition[0]) / count;
      if (startPosition[1] - endPosition[1] > 0) {
        dlt = -dlt;
      }
      for (let i = 0; i < count; i++) {
        let h = height - (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) / Math.pow(L, 2);
        let lon = startPosition[0] + delLon * i;
        let lat = startPosition[1] + dlt * i;
        let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
        result.push(point);
      }
    }
    return result;
  }
}

/**
 *  精灵穿梭路光效果，
 *  参考gitee开源
 *  entity的材质使用MaterialProperty,而promise使用的是material。
 *  @Data：2022-01-11
 */

class Spriteline1MaterialProperty {
  constructor(duration, image) {
    this._definitionChanged = new Cesium.Event();
    this.duration = duration;
    this.image = image;
    this._time = performance.now();
  }
}
Object.defineProperties(Spriteline1MaterialProperty.prototype, {
  isConstant: {
    get: function () {
      return false;
    },
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },
  color: Cesium.createPropertyDescriptor('color'),
  duration: Cesium.createPropertyDescriptor('duration'),
});
Spriteline1MaterialProperty.prototype.getType = function (time) {
  return 'Spriteline1';
};
Spriteline1MaterialProperty.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.image = this.image;
  result.time = ((performance.now() - this._time) % this.duration) / this.duration;
  return result;
};
Spriteline1MaterialProperty.prototype.equals = function (e) {
  return this === e || (e instanceof Spriteline1MaterialProperty && this.duration === e.duration);
};
Cesium.Spriteline1MaterialProperty = Spriteline1MaterialProperty;
Cesium.Material.Spriteline1Type = 'Spriteline1';
Cesium.Material.Spriteline1Source = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
czm_material material = czm_getDefaultMaterial(materialInput);
vec2 st = materialInput.st;
vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));
material.alpha = colorImage.a;
material.diffuse = colorImage.rgb * 1.5 ;
return material;
}
`;
// st :二维纹理坐标
// czm_material：保存可用于照明的材质信息
Cesium.Material._materialCache.addMaterial(Cesium.Material.Spriteline1Type, {
  fabric: {
    type: Cesium.Material.Spriteline1Type,
    uniforms: {
      color: new Cesium.Color(1, 0, 0, 0.5),
      image: '',
      transparent: true,
      time: 20,
    },
    source: Cesium.Material.Spriteline1Source,
  },
  translucent: function (material) {
    return true;
  },
});

/**
 * circleDiffusion：圆扩散
 * 参考gitee上的ts代码
 */

// 圆扩散
class CircleDiffusion {
  viewer;
  lastStageList;
  constructor(viewer) {
    this.viewer = viewer;
    this.lastStageList = [];
    // js语法的每行结尾的“分号”可写可不写
  }
  add(position, scanColor, maxRadius, duration) {
    this.lastStageList.push(this.showCircleScan(position, scanColor, maxRadius, duration));
  }
  clear() {
    this.lastStageList.forEach((ele) => {
      this.clearScanEffects(ele);
    });
    this.lastStageList = [];
  }
  /**
   * 圆扩散
   * @param {*} position  扫描中心 如[117.270739,31.84309,32]
   * @param {*} scanColor 扫描颜色 如"rgba(0,255,0,1)"
   * @param {*} maxRadius 扫描半径，单位米 如1000米
   * @param {*} duration 持续时间，单位毫秒 如4000
   */
  showCircleScan(position, scanColor, maxRadius, duration) {
    const cartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(position[0]), Cesium.Math.toRadians(position[1]), position[2]);
    scanColor = new Cesium.Color.fromCssColorString(scanColor);
    const lastStage = this._addCircleScanPostStage(cartographicCenter, maxRadius, scanColor, duration);
    return lastStage;
  }
  /**
   * 添加扩散效果扫描线
   * @param {*} cartographicCenter  扫描中心
   * @param {*} maxRadius 扫描半径
   * @param {*} scanColor  扫描颜色
   * @param {*} duration  持续时间
   */
  _addCircleScanPostStage(cartographicCenter, maxRadius, scanColor, duration) {
    const _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
    const _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
    const _CartograhpicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
    const _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartograhpicCenter1);
    const _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
    const _time = new Date().getTime();
    const _scratchCartesian4Center = new Cesium.Cartesian4();
    const _scratchCartesian4Center1 = new Cesium.Cartesian4();
    const _scratchCartesian3Normal = new Cesium.Cartesian3();
    const _this = this;
    const ScanPostStage = new Cesium.PostProcessStage({
      fragmentShader: _this._getScanSegmentShader(),
      uniforms: {
        u_scanCenterEC: function () {
          const temp = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
          return temp;
        },
        u_scanPlaneNormalEC: function () {
          const temp = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
          const temp1 = Cesium.Matrix4.multiplyByVector(_this.viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
          _scratchCartesian3Normal.x = temp1.x - temp.x;
          _scratchCartesian3Normal.y = temp1.y - temp.y;
          _scratchCartesian3Normal.z = temp1.z - temp.z;
          Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
          return _scratchCartesian3Normal;
        },
        u_radius: function () {
          return (maxRadius * ((new Date().getTime() - _time) % duration)) / duration;
        },
        u_scanColor: scanColor,
      },
    });
    this.viewer.scene.postProcessStages.add(ScanPostStage);
    return ScanPostStage;
  }
  /**
   * 扩散效果Shader
   */
  _getScanSegmentShader() {
    const inpram = 18;
    const scanSegmentShader =
      ` uniform sampler2D colorTexture;
          uniform sampler2D depthTexture;
          varying vec2 v_textureCoordinates;
          uniform vec4 u_scanCenterEC;
          uniform vec3 u_scanPlaneNormalEC;
          uniform float u_radius;
          uniform vec4 u_scanColor;
          vec4 toEye(in vec2 uv, in float depth){
            vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
            vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
            posInCamera =posInCamera / posInCamera.w;
            return posInCamera;
          }
          vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){
              vec3 v01 = point - planeOrigin;
              float d = dot(planeNormal, v01) ;
              return (point - planeNormal * d);
          }
          float getDepth(in vec4 depth){
              float z_window = czm_unpackDepth(depth);
              z_window = czm_reverseLogDepth(z_window);
              float n_range = czm_depthRange.near;
              float f_range = czm_depthRange.far;
              return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
          }
          void main(){
              gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
              float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
              vec4 viewPos = toEye(v_textureCoordinates, depth);
              vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
              float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
              if(dis < u_radius){
                float f = 1.0 - abs(u_radius - dis) / u_radius;
                f = pow(f, float(` +
      inpram +
      `));
                gl_FragColor = mix(gl_FragColor,u_scanColor,f);
              }
              gl_FragColor.a = gl_FragColor.a / 2.0;
          }
        `;
    return scanSegmentShader;
  }
  /**
   * 清除特效对象
   * @param {*} lastStage 特效对象
   */
  clearScanEffects(lastStage) {
    this.viewer.scene.postProcessStages.remove(lastStage);
  }
}

/*
 * @Description: 扫描圆效果（参考开源代码）
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-04 17:22:05
 * @LastEditors: Julian
 * @LastEditTime: 2022-03-04 17:23:52
 */
class CircleScanMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._speed = undefined;
    this.color = options.color;
    this.speed = options.speed;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType(time) {
    return Cesium.Material.CircleScanMaterialType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }

    result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
    result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof CircleScanMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed))
    );
  }
}

Object.defineProperties(CircleScanMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed'),
});

Cesium.CircleScanMaterialProperty = CircleScanMaterialProperty;
Cesium.Material.CircleScanMaterialProperty = 'CircleScanMaterialProperty';
Cesium.Material.CircleScanMaterialType = 'CircleScanMaterialType';
Cesium.Material.CircleScanMaterialSource = `
uniform vec4 color;
uniform float speed;

float circle(vec2 uv, float r, float blur) {
  float d = length(uv) * 2.0;
  float c = smoothstep(r+blur, r, d);
  return c;
}

czm_material czm_getMaterial(czm_materialInput materialInput)
{
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st - .5;
  material.diffuse = color.rgb;
  material.emission = vec3(0);
  float t =fract(czm_frameNumber * speed / 1000.0);
  float s = 0.3;
  float radius1 = smoothstep(1.0, s, t) * 0.5;
  float alpha1 = circle(st, radius1, 0.01) * circle(st, radius1, -0.01);
  float alpha2 = circle(st, radius1, 0.01 - radius1) * circle(st, radius1, 0.01);
  float radius2 = 0.5 + smoothstep(s, 1.0, t) * 0.5;
  float alpha3 = circle(st, radius1, radius2 + 0.01 - radius1) * circle(st, radius1, -0.01);
  material.alpha = smoothstep(1.0, s, t) * (alpha1 + alpha2*0.1 + alpha3*0.1);
  material.alpha *= color.a;
  return material;
}

`;

Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleScanMaterialType, {
  fabric: {
    type: Cesium.Material.CircleScanMaterialType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
      speed: 10.0,
    },
    source: Cesium.Material.CircleScanMaterialSource,
  },
  translucent: function (material) {
    return true;
  },
});

/**
 * 线圈发光圆效果
 */
class ScanlineMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._speed = undefined;
    this.color = options.color || Cesium.Color.YELLOW;
    this.speed = options.speed || 10;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType(_time) {
    return Cesium.Material.ScanlineType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.speed = this.speed;
    return result;
  }

  equals(other) {
    const reData =
      this === other ||
      (other instanceof ScanlineMaterialProperty &&
        Cesium.Property.equals(this.color, other.color) &&
        Cesium.Property.equals(this.speed, other.speed));
    return reData;
  }
}

Object.defineProperties(ScanlineMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed'),
});

Cesium.ScanlineMaterialProperty = ScanlineMaterialProperty;
Cesium.Material.ScanlineType = 'Scanline';
Cesium.Material.ScanlineSource = `
uniform vec4 color;
uniform float speed;
float circle(vec2 uv, float r, float blur) {
  float d = length(uv) * 1.0; /* 2.0 */
  float c = smoothstep(r+blur, r, d);
  return c;
}
czm_material czm_getMaterial(czm_materialInput materialInput)
{
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st - 0.5;
  material.diffuse = 2.8 * color.rgb;
  material.emission = vec3(0);
  float t = fract(czm_frameNumber * speed / 1000.0);
  float s = 0.1;
  float radius1 = smoothstep(1.0, s, t) * 0.5;
  float alpha1 = circle(st, radius1, 0.01) * circle(st, radius1, -0.01);
  float alpha2 = circle(st, radius1, 0.01 - radius1) * circle(st, radius1, 0.01);
  float radius2 = 0.5 + smoothstep(s, 1.0, t) * 0.5;
  float alpha3 = circle(st, radius1, radius2 + 0.01 - radius1) * circle(st, radius1, -0.01);
  material.alpha = smoothstep(1.0, s, t) * (alpha1 + alpha2*0.1 + alpha3*0.1);
  material.alpha *= color.a ;
  return material;
}
`;
Cesium.Material._materialCache.addMaterial(Cesium.Material.ScanlineType, {
  fabric: {
    type: Cesium.Material.ScanlineType,
    uniforms: {
      color: new Cesium.Color(1, 0, 0, 0.5),
      time: 0,
      speed: 10,
    },
    source: Cesium.Material.ScanlineSource,
  },
  translucent: function (t) {
    return true;
  },
});

/*
 * @Description: 闪烁线材质
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-30 16:40:09
 * @LastEditors: Julian
 * @LastEditTime: 2022-03-30 17:22:04
 */
class LineFlickerMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._speed = undefined;
    this.color = options.color;
    this.speed = options.speed;
    this.image = options.image;
    this.time = options.time;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType(time) {
    return Cesium.Material.LineFlickerMaterialType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }

    result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
    result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
    result.image = this.image;
    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof LineFlickerMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed))
    );
  }
}

Object.defineProperties(LineFlickerMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed'),
});

Cesium.LineFlickerMaterialProperty = LineFlickerMaterialProperty;
Cesium.Material.LineFlickerMaterialProperty = 'LineFlickerMaterialProperty';
Cesium.Material.LineFlickerMaterialType = 'LineFlickerMaterialType';
Cesium.Material.LineFlickerMaterialSource = `
  uniform vec4 color;
  uniform float speed;
  czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  float time = fract( czm_frameNumber  *  speed / 1000.0);
  vec2 st = materialInput.st;
  float scalar = smoothstep(0.0,1.0,time);

  vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));
  material.alpha = colorImage.a;
  material.diffuse = colorImage.rgb;
  return material;
}
`;

Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlickerMaterialType, {
  fabric: {
    type: Cesium.Material.LineFlickerMaterialType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
      speed: 5.0,
      image: '/staticRecourse/mapRecourse/marker/安全生产/规上企业.png',
      time: 20,
    },
    source: Cesium.Material.LineFlickerMaterialSource,
  },
  translucent: function (material) {
    return true;
  },
});

//流动墙材质
function TrailLineMaterialProperty(options) {
  // 默认参数设置
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this._colorSubscription = undefined;
  this.color = options.color;
  this.trailImage = options.image;
  this.duration = options.duration;
  this._time = new Date().getTime();
  this.count = Cesium.defaultValue(options.count, 2);
  if (this.count <= 0) {
    this.count = 1;
  }
}
Object.defineProperties(TrailLineMaterialProperty.prototype, {
  isConstant: {
    get: function () {
      return false;
    },
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },
  color: Cesium.createPropertyDescriptor('color'),
  count: Cesium.createPropertyDescriptor('count'),
  image: Cesium.createPropertyDescriptor('image'),
});
TrailLineMaterialProperty.prototype.getType = function (time) {
  return 'TrailLine';
};
TrailLineMaterialProperty.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  result.count = this.count;
  if (this.trailImage) {
    result.image = this.trailImage;
  } else {
    result.image = Cesium.Material.TrailLineImage;
  }
  if (this.duration) {
    result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
  }
  viewer.scene.requestRender();
  return result;
};
TrailLineMaterialProperty.prototype.equals = function (other) {
  return this === other || (other instanceof TrailLineMaterialProperty && Cesium.Property.equals(this._color, other._color));
};
Cesium.TrailLineMaterialProperty = TrailLineMaterialProperty;
Cesium.Material.TrailLineType = 'TrailLine';
Cesium.Material.TrailLineImage = '/staticRecourse/mapRecourse/image/roadArrow.png';
Cesium.Material.TrailLineSource = `czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    st.s*=count/1.;
    st=fract(st);
    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));
    material.alpha = colorImage.a * color.a;
    material.diffuse = colorImage.rgb;
    return material;
}`;
Cesium.Material._materialCache.addMaterial(Cesium.Material.TrailLineType, {
  fabric: {
    type: Cesium.Material.TrailLineType,
    uniforms: {
      color: new Cesium.Color(1.0, 1.0, 1.0, 1),
      image: Cesium.Material.TrailLineImage,
      count: 1,
      time: 0,
    },
    source: Cesium.Material.TrailLineSource,
  },
  translucent: function (material) {
    return true;
  },
});

/**
 * @description:公园立方体的材质，设置四周和顶盖不同的颜色
 * @date: 2022-02-11
 */

//动态墙材质
function DynamicWallMaterialProperty(options) {
  // 默认参数设置
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this._colorSubscription = undefined;
  this.color = options.color;
  this.duration = options.duration;
  this.trailImage = options.trailImage;
  this._time = new Date().getTime();
}
Object.defineProperties(DynamicWallMaterialProperty.prototype, {
  isConstant: {
    get: function () {
      return false;
    },
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },
  color: Cesium.createPropertyDescriptor('color'),
});
DynamicWallMaterialProperty.prototype.getType = function (time) {
  return 'DynamicWall';
};
DynamicWallMaterialProperty.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  if (this.trailImage) {
    result.image = this.trailImage;
  } else {
    result.image = Cesium.Material.DynamicWallImage;
  }

  if (this.duration) {
    result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
  }
  viewer.scene.requestRender();
  return result;
};
DynamicWallMaterialProperty.prototype.equals = function (other) {
  return this === other || (other instanceof DynamicWallMaterialProperty && Cesium.Property.equals(this._color, other._color));
};
Cesium.DynamicWallMaterialProperty = DynamicWallMaterialProperty;
Cesium.Material.DynamicWallType = 'DynamicWall';
Cesium.Material.DynamicWallImage = '/staticRecourse/mapRecourse/image/blackGradualChange.png';
Cesium.Material.DynamicWallSource = `czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    vec4 colorImage = texture2D(image, vec2(fract(st.t - time), st.t));
    vec4 fragColor;
    fragColor.rgb = color.rgb / 1.0;
    fragColor = czm_gammaCorrect(fragColor);
    float alpha = (1. - colorImage.r) * color.a;
    if(colorImage.rgb == vec3(1.)){
      alpha = 0.;
    }
    material.alpha = alpha;
    material.diffuse = color.rgb;
    material.emission = fragColor.rgb;
    return material;
}`;
Cesium.Material._materialCache.addMaterial(Cesium.Material.DynamicWallType, {
  fabric: {
    type: Cesium.Material.DynamicWallType,
    uniforms: {
      color: new Cesium.Color(1.0, 1.0, 1.0, 1),
      image: Cesium.Material.DynamicWallImage,
      time: 0,
    },
    source: Cesium.Material.DynamicWallSource,
  },
  translucent: function (material) {
    return true;
  },
});

/**
 * 水波纹扩散材质
 * @param {*} color  颜色
 * @param {*} duration 持续时间 毫秒
 * @param {*} count  波浪数量
 * @param {*} gradient 渐变曲率
 */
function CircleWaveMaterialProperty(ob) {
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this._colorSubscription = undefined;
  this.color = ob.color;
  this.duration = Cesium.defaultValue(ob.duration, 1000);
  this.count = Cesium.defaultValue(ob.count, 2);
  if (this.count <= 0) {
    this.count = 1;
  }
  this.gradient = Cesium.defaultValue(ob.gradient, 0.1);
  if (this.gradient === 0) {
    this.gradient = 0;
  }
  if (this.gradient > 1) {
    this.gradient = 1;
  }
  this._time = new Date().getTime();
}
Object.defineProperties(CircleWaveMaterialProperty.prototype, {
  isConstant: {
    get: function () {
      return false;
    },
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },
  color: Cesium.createPropertyDescriptor('color'),
  duration: Cesium.createPropertyDescriptor('duration'),
  count: Cesium.createPropertyDescriptor('count'),
});
CircleWaveMaterialProperty.prototype.getType = function (_time) {
  return Cesium.Material.CircleWaveMaterialType;
};
CircleWaveMaterialProperty.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
  result.count = this.count;
  result.gradient = 1 + 10 * (1 - this.gradient);
  return result;
};
CircleWaveMaterialProperty.prototype.equals = function (other) {
  const reData = this === other || (other instanceof CircleWaveMaterialProperty && Cesium.Property.equals(this._color, other._color));
  return reData;
};
Cesium.CircleWaveMaterialProperty = CircleWaveMaterialProperty;
Cesium.Material.CircleWaveMaterialType = 'CircleWaveMaterial';
Cesium.Material.CircleWaveSource = `
czm_material czm_getMaterial(czm_materialInput materialInput) {
  czm_material material = czm_getDefaultMaterial(materialInput);
  material.diffuse = 1.5 * color.rgb;
  vec2 st = materialInput.st;
  vec3 str = materialInput.str;
  float dis = distance(st, vec2(0.5, 0.5));
  float per = fract(time);
  if (abs(str.z) > 0.001) {
    discard;
  }
  if (dis > 0.5) {
    discard;
  } else {
    float perDis = 0.5 / count;
    float disNum;
    float bl = .0;
    for (int i = 0; i <= 9; i++) {
      if (float(i) <= count) {
        disNum = perDis *float(i) - dis + per / count;
        if (disNum > 0.0) {
          if (disNum < perDis) {
            bl = 1.0 - disNum / perDis;
          } else if(disNum - perDis < perDis) {
            bl = 1.0 - abs(1.0 - disNum / perDis);
          }
          material.alpha = pow(bl, gradient);
        }
      }
    }
  }
  return material;
}
`;
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleWaveMaterialType, {
  fabric: {
    type: Cesium.Material.CircleWaveMaterialType,
    uniforms: {
      color: new Cesium.Color(1, 0, 0, 1),
      time: 1,
      count: 1,
      gradient: 0.1,
    },
    source: Cesium.Material.CircleWaveSource,
  },
  translucent: function (material) {
    return true;
  },
});

/**
 * 圆扩散材质
 * @param {*} color  颜色
 * @param {*} duration 持续时间 毫秒
 * @param {*} count  波浪数量
 * @param {*} gradient 渐变曲率
 */
function CircleDiffusionMaterialProperty(ob) {
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this._colorSubscription = undefined;
  this.color = ob.color;
  this.duration = Cesium.defaultValue(ob.duration, 1000);
  this.count = Cesium.defaultValue(ob.count, 2);
  if (this.count <= 0) {
    this.count = 1;
  }
  this.gradient = Cesium.defaultValue(ob.gradient, 0.1);
  if (this.gradient === 0) {
    this.gradient = 0;
  }
  if (this.gradient > 1) {
    this.gradient = 1;
  }
  this._time = new Date().getTime();
}
Object.defineProperties(CircleDiffusionMaterialProperty.prototype, {
  isConstant: {
    get: function () {
      return false;
    },
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },
  color: Cesium.createPropertyDescriptor('color'),
  duration: Cesium.createPropertyDescriptor('duration'),
  count: Cesium.createPropertyDescriptor('count'),
});
CircleDiffusionMaterialProperty.prototype.getType = function (_time) {
  return Cesium.Material.CircleDiffusionMaterialType;
};
CircleDiffusionMaterialProperty.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
  result.count = this.count;
  result.gradient = 1 + 10 * (1 - this.gradient);
  return result;
};
CircleDiffusionMaterialProperty.prototype.equals = function (other) {
  const reData = this === other || (other instanceof CircleDiffusionMaterialProperty && Cesium.Property.equals(this._color, other._color));
  return reData;
};
Cesium.CircleDiffusionMaterialProperty = CircleDiffusionMaterialProperty;
Cesium.Material.CircleDiffusionMaterialType = 'CircleDiffusionMaterial';
Cesium.Material.CircleDiffusionSource = `
czm_material czm_getMaterial(czm_materialInput materialInput) {
  czm_material material = czm_getDefaultMaterial(materialInput);
  material.diffuse = 1.5 * color.rgb;
  vec2 st = materialInput.st;
  vec3 str = materialInput.str;
  float dis = distance(st, vec2(0.5, 0.5));
  float per = fract(time);
  if (abs(str.z) > 0.001) {
    discard;
  }
  if (dis > 0.5) {
    discard;
  } else {
    float perDis = 0.5 / count;
    float disNum;
    float bl = .0;
    for (int i = 0; i <= 9; i++) {
      if (float(i) <= count) {
        disNum = perDis *float(i) - dis + per / count;
        if (disNum > 0.0) {
          if (disNum < perDis) {
            bl = 1.0 - disNum / perDis;
          } else if(disNum - perDis < perDis) {
            bl = 1.0 - abs(1.0 - disNum / perDis);
          }
          material.alpha = pow(bl, .9);
        }
      }
    }
  }
  return material;
}
`;
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleDiffusionMaterialType, {
  fabric: {
    type: Cesium.Material.CircleDiffusionMaterialType,
    uniforms: {
      color: new Cesium.Color(1, 0, 0, 1),
      time: 1,
      count: 1,
      gradient: 0.1,
    },
    source: Cesium.Material.CircleDiffusionSource,
  },
  translucent: function (material) {
    return true;
  },
});
export {
  WallDiffuseMaterialProperty,
  LineFlowMaterialProperty,
  parabolaFlowInit,
  CustomMaterialLine,
  Spriteline1MaterialProperty,
  CircleDiffusion,
  CircleScanMaterialProperty,
  ScanlineMaterialProperty,
  LineFlickerMaterialProperty,
  TrailLineMaterialProperty,
  CircleWaveMaterialProperty,
  CircleDiffusionMaterialProperty
};
