import xp from './algorithm.js';
export default class Draw {
  /*
    parentNode 参数可选 {
      drawData:保存当前绘制实例；
      recData：删除后需要恢复数据；
      selectId:选中当前id，主要用于橡皮擦；
      deleteSelect：删除选中当前id，主要用于橡皮擦；
      controlFlags：键盘、鼠标控制移动地图；
      drawItem：绘制完成后需要的回调；
    }
    viewer：Cesium.ciewer;
    config: 绘制时需要参数{ 
      imgUrl: '', //点样式
      pointSize: 1, //点位大小
      textColor: 'red', //标注颜色
      textSize: 14, //标注大小
      style: 'solid', //样式

      // ============必选参数================
      color: '#ffd700', //填充
      borderColor: '#ffd700', //边框,线条颜色
      borderSize: 2, //粗细
      alpha: 0.3, // 透明
      type: 'circle',
      label: '圆形',
      // ============必选参数end=================
      // objId:示例当前id，不传自动生成
    }
    isChange：是否改变大小，主要用于圆形修改
  */
  constructor(parentNode, viewer, config = { id: "pen" },objId,isChange) {
    this.viewer = viewer;
		this.config = config;
    this.type = this.config.type;
    this.objId = objId || new Date().getTime();
    this.isChange = isChange;
    this.positions = [];
    this.addDraw = null;
    this.parentMarkerObj = {}; 
    // this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.isTouch=false
    this.onoff =false;
    this.touchTime = 0;
    this.oldx =-10;
    this.oldy =-10;
    this.container = null;
    this.moveMapsFinger = false;
    this.startEvent = null;
    window.scope = this;
    this.parentNode = parentNode; 
  }
	// isTouch(){ // 是否pc
	// 	// var flag = true;
	// 	// if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
	// 	// 	flag = false;
	// 	// }
	// 	// return flag;
  //   return ("ontouchstart" in window); // 是否触屏
	// }
  start({isSwitch},callback) {
    const box = document.querySelector('.cesium-mask'); 
    const that = this
    var moveWheel1 = true;
    var moveWheel2 = false;
    var wheelClock;
    function stopWheel(){
        if(moveWheel2 == true){
            // console.log("滚轮停止了");
            moveWheel2 = false;
            moveWheel1 = true;
            that.closeMoveMap()
        }
    }
    function moveWheel(e){
      var e = e || window.event;
      if(moveWheel1==true){
        if(e.wheelDelta){
          if(e.wheelDelta > 0) {
            this.parentNode?.controlFlags && (this.parentNode.controlFlags.moveUp = true);
            // console.log("鼠标滚轮向上滚动")
          };
          if(e.wheelDelta < 0){
            this.parentNode?.controlFlags && (this.parentNode.controlFlags.moveDown = true);
            // console.log("鼠标滚轮向下滚动")
          }
        }
          moveWheel1 = false;
          moveWheel2 = true;
          wheelClock = setTimeout(stopWheel,200);
      }
      else {
          clearTimeout(wheelClock);
          wheelClock = setTimeout(stopWheel,150);
      }
    }
    box.addEventListener('wheel', moveWheel, false);
//=======================滚轮结束==================================
    if(!this.container){
      this.container = this.config.label+this.parentNode?.drawData?.length??0; // 名称累加
    }
    
    if(isSwitch)  this.touchOff(); 
		// if(this.isTouch()) {
      box.addEventListener('touchstart',e=>{
        e.preventDefault()
        this.mousedown({e,callback})
      }, false);  
      box.addEventListener('touchmove',e=>{
        e.preventDefault()
        this.mousemove({e})
      }, false);  
      box.addEventListener('touchend',e=>{
        e.preventDefault()
        this.mouseup({e,callback})
      }, false);  
      // $(box).on('touchstart', (e) => {
      //   e.preventDefault()
      //   this.mousedown({e,callback})
      // })
      // $(box).on('touchmove', (e) => {
      //   e.preventDefault()
      //   this.mousemove({e})
      // })
      // $(box).on('touchend', (e) => {
      //   e.preventDefault()
      //   this.mouseup({e,callback})
      // })
		// }else{
			box.onmousedown = (e) => {
        // this.pauseEvent(e)
        e.preventDefault()
        if(e.button ==2){
          console.log("点了右键");
          this.mouseup({e,callback});
        }else {
          this.mousedown({e,callback});
          //添加鼠标移动事件  
          this.startEvent = e;
          box.onmousemove = (o) => {
            // this.pauseEvent(e)
            o.preventDefault()
            this.mousemove({o});
          }
          document.onmouseup = (o) => {
            if(this.onoff) this.mouseup({o,callback});
          }
        }
      }
		// }
  }
  pauseEvent(e){//移除默认
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
  }
  moveMapsFingerFn({screen},type){//移动绘制 地图移动
    const box = document.querySelector('.cesium-mask');
    const toolbar = 0//document.querySelector('.toolbar');
    const leftMenu = 0//document.querySelector('.left-menu');
    if(type=='move' && this.moveMapsFinger && this.parentNode?.controlFlags){
      if(!screen) return;
      if(screen.x <= 0+5) {
        this.parentNode.controlFlags.moveLeft = true;
      }else if(screen.x>=box.offsetWidth-5 - (leftMenu?.offsetWidth || 0)) {
        this.parentNode.controlFlags.moveRight = true;
      }else if(screen.y<=toolbar.offsetHeight+5) {
        this.parentNode.controlFlags.moveForward = true;
      }else if(screen.y>=box.offsetHeight-5) {
        this.parentNode.controlFlags.moveBackward = true;
      }else{
        this.closeMoveMap();
      }
    }else{
      this.closeMoveMap();
      this.moveMapsFinger = false;
    }
  }
  closeMoveMap(){
    if(!this.parentNode?.controlFlags) return;
    this.parentNode.controlFlags.moveLeft = false; // 上
    this.parentNode.controlFlags.moveRight = false; // 右
    this.parentNode.controlFlags.moveForward = false; // 上
    this.parentNode.controlFlags.moveBackward = false; //下
    this.parentNode.controlFlags.moveUp = false; // 放大
    this.parentNode.controlFlags.moveDown = false; // 缩小
  }
  getCoordinate(e){
    let res = e;
    if(e.type=="touchstart" || e.type=="touchmove") res =  e.originalEvent.touches[0];
    let x=0,y=0;
    const box = document.querySelector('#plotMainBox'); // 兼容后指大屏
    if(box){
      const {offsetLeft,offsetTop} = box;
      x = offsetLeft; y = offsetTop;
    }
    return {x:res.pageX - x,y:res.pageY - y}
    // {x:res.pageX,y:res.pageY}
  }
  drawAll({e,cartesian,callback},type){
    // console.log(type,'drawAll===');
    if(type == 'down' || type == 'load'){      
      if(this.config.double) {
        this.doubleTouch(e,callback,type)
      }
      switch (this.config.type) {
        case "drawPoint": //
        case "drawPoint-custom": //
          this.addDraw = this.creatDrawPoint();
          break;
        case "drawModel": //
          this.addDraw = this.creatDrawModel();
          break;
        case "text": //
          // if(e) e.target.style.zIndex = 1; // 防止未双击结束
          this.creatText({callback},type);
          break;
        case "pincerArrow": //
          if (Cesium.defined(this.addDraw)) return;
          this.addDraw = this.creatPincerArrow({callback},type)
          break;
      }
    }
    if(type == 'move' || type == 'load'){
      if(['pen','arbitrarily'].includes(this.config.type)){
        if(cartesian) this.positions.push(cartesian);
        // console.log(this.positions,"=this.positions");
      }else if(!this.config.double && !this.config.pointNum){ // 排除点击载入事件 
        if(cartesian) this.positions[1] = cartesian;
      }
      if (Cesium.defined(this.addDraw)) return;
      
      switch (this.config.type) {
        case "pen": //pen
        case "line":
          this.addDraw = this.creatLine(this.positions);
          break;
        case "arbitrarily": 
          this.addDraw = this.creatPolygon(this.positions);
          break;
        // case "line":
        //   this.addDraw = this.creatLine(this.positions);
        //   break;
        case "circle":
          this.addDraw = this.creatCircle(this.positions,type);
          break;
        case "ellipse":
          this.addDraw = this.creatEllipse(this.positions);
          break;
        case "equilateral":
          this.addDraw = this.creatEquilateral(this.positions);
          break;
        case "rect":
          this.addDraw = this.creatRect(this.positions);
          break;
        case "arrow":
          this.addDraw = this.creatArrow(this.positions);
          break;
      }
    }
  }
  eraserFn({screenPos}){
    const pick = viewer.scene.pick(screenPos);
    if (Cesium.defined(pick) && pick.id && pick.id.objId && this.parentNode) {
      this.parentNode.selectId = pick.id.objId;
      this.parentNode?.deleteSelect();
    }
  } 
	mousedown({e,callback}){
    this.onoff = true;
    if(e.button==1) return;
    this.moveMapsFinger = true;// 移动
    this.oldx = this.getCoordinate(e).x;
    this.oldy = this.getCoordinate(e).y;
    const position = {x:this.oldx,y:this.oldy};

    if(this.config.type == 'eraser'){ // 橡皮擦
      return this.eraserFn({screenPos:position})
    }

    let nowTime = new Date().getTime();
    if((nowTime - this.touchTime)  < 250 && this.positions.length >1){ // 双击触发
      return this.doubleTouch(e,callback,'down',true);
    }else{
      this.touchTime = JSON.parse(JSON.stringify(nowTime));
    };

		// 单机开始绘制
    const cartesian = this.getCatesian3FromPX(position, this.viewer);
    // this.viewer.scene.screenSpaceCameraController.enableRotate = false; //锁定相机
    if (!cartesian) return;
    
    if (this.config.double || this.positions.length == 0 || this.config.pointNum) { 
      this.positions.push(cartesian);
    }
    if(this.config.type=='text') this.positions[0] = cartesian; 
    if(this.parentNode && this.config.type!='eraser') {
      // if(e) e.target.style.zIndex = 9999; // 防止未双击结束
      this.parentNode.recData = []; //清除恢复
    }
    this.drawAll({e,callback},'down') 
	}
	mousemove({o:e}){
		if (!this.onoff) return;
    const screen = this.getCoordinate(e);
    if(this.startEvent && this.startEvent.button==1 && this.parentNode?.controlFlags){
      const oldScreen = this.getCoordinate(this.startEvent);
      const num = 5
      if(oldScreen.x - screen.x > num){
        this.parentNode.controlFlags.moveLeft = true;
      }
      if(oldScreen.x - screen.x < -num){
        this.parentNode.controlFlags.moveRight = true;
      }
      if(oldScreen.y - screen.y > num){
        this.parentNode.controlFlags.moveForward = true;
      }
      if(oldScreen.y - screen.y < -num){
        this.parentNode.controlFlags.moveBackward = true;
      }
      return;
      // this.startEvent = JSON.parse(JSON.stringify(e));
    }

    if(this.config.type == 'eraser'){ // 橡皮擦
      return this.eraserFn({screenPos:screen})
    }

		if (!this.positions.length) return;
    this.moveMapsFingerFn({screen},'move');
    
    const cartesian = this.getCatesian3FromPX(screen, this.viewer);
    if (!cartesian) return;
    this.drawAll({cartesian},'move');
	}
  mouseup({e,callback}){
      if(this.startEvent?.button == 1){
        this.startEvent = null;
        return this.closeMoveMap();
      }
		// 单机开始绘制
    if(this.config.type == 'eraser'){ // 橡皮擦
      return this.onoff = false;
    }
    this.moveMapsFingerFn({},'up');
    if(this.config.type == 'circle' && this.viewer.entities.getById('pointRadius')){
      this.viewer.entities.removeById('pointRadius');
    }
    this.onoff = false;
    if( this.config.type && (
        (!this.config.pointNum && !['text','eraser'].includes(this.config.type) && !this.config.double) || 
        (this.config.pointNum && this.positions.length >= this.config.pointNum) || 
        (!this.config.pointNum && this.positions.length && e?.button == 2)
      )) {
      this.touchOff();
      // this.parentNode?.drawData?.push(this); //释放添加数据
      console.log(this.parentNode?.drawItem,"this.parentNode?.drawItem");
      if(this.parentNode?.drawItem) this.parentNode.drawItem({},callback && callback(this)) // 回调
      else callback && callback(this)
    }
	}
  touchOff(){
    const box = document.querySelector('.cesium-mask');
    box.onmousedown = null;
    box.onmousemove = null;
    box.onmouseup = null;
    box.removeEventListener("touchstart",e=>{}, false);
    box.removeEventListener("touchmove",e=>{}, false);
    box.removeEventListener("touchend",e=>{}, false);
    // $(box).off('touchstart')
    // $(box).off('touchmove')
    // $(box).off('touchend')
  }
  doubleTouch(e,callback,type,isDoubel){
    // let nowTime = new Date().getTime();
    // if((nowTime - this.touchTime)  < 250 && this.positions.length >1){ // 双击触发
    if(isDoubel){
      this.positions = this.positions.slice(0,this.positions.length-1) // 移除双击结束点位;
      //==================================
      if(this.config.type=='lineSpace'){
        const entities = this.viewer.entities;
        const entity = entities.getById(this.objId);
        entity?._children?.forEach((child,index) => {
          if(entity._children.length -1 ==  index) entities.remove(child);
        })
      }
      //==================================
      this.touchOff();
      // this.parentNode?.drawData?.push(this); //释放添加数据
      this.parentNode?.drawItem({},callback && callback(this));
      return;
    // }else{
    //   this.touchTime = JSON.parse(JSON.stringify(nowTime));
    };
    
    if (!Cesium.defined(this.addDraw)){
      switch (this.config.type) {
        case "polygon":
          this.addDraw = this.creatPolygon(this.positions);
          break;
        case "brokenLine":
          this.addDraw = this.creatLine(this.positions);
          break;
        case "attackArrow":
          this.addDraw = this.creatAttackArrow(this.positions);
          break;
        case "lineSpace": 
          this.creatLineSpace(type);
          break;
      }
    }
  }
  creatLineSpace(type){
    const $this = this;
    function fun(positions){
      let distance = 0;
      if (positions.length >= 2) {
        distance = $this.getSpaceDistance(positions);
      }
      var textDisance = distance + "米";

      if (!$this.parentMarkerObj[$this.objId]) {
        $this.parentMarkerObj[$this.objId] = viewer.entities.add(new Cesium.Entity({
          id:$this.objId,
        }));
      }
      const points = viewer.entities.add({
        parent:$this.parentMarkerObj[$this.objId],
        name: '空间直线距离',
        chooseId:$this.objId,
        position:positions[positions.length - 1],
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED.withAlpha(0),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference:Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.MAX_VALUE,
          clampToGround: true,
        },
        polyline: {
          show: true,
          positions: new Cesium.CallbackProperty(() => (type=='load'?positions:$this.positions), false),
          material: Cesium.Color.CHARTREUSE  ,
          width: 2,
          clampToGround: true,
        },
        label: {
          text: textDisance,
          font: '18px sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#fff'),//Cesium.Color.GOLD,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(20, -20),
          // heightReference:Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.MAX_VALUE,
          showBackground: true,
          outlineColor: Cesium.Color.fromCssColorString('#fff'),
          backgroundColor: Cesium.Color.GOLD,//Cesium.Color.fromCssColorString(borderColor||'#D1210F'),
        }
      });
    }
    if(type=='load'){
      this.positions.forEach((item,index)=>{
        fun(this.positions.slice(0,index+1))
      })
    }else{
      fun(this.positions)
    }
    // return points;
  }
  creatText({callback},type){
    if(type=='load'){
      this.addDraw = this.addTxt(this.positions[0]);
      if(this.parentNode) {
        // this.parentNode?.drawData?.push(this); //释放添加数据
        this.parentNode?.drawItem()
      }
      return;
    }

    const $this = this,cartesian=this.positions[0];
    const rectangle = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian);
    const html = `
    <div class="add-marker-container">
      <input name="marker-text-value" id="marker-text-value" />
      <button id="marker-confirm">确定</button><button id="marker-cancel">取消</button>
    </div>
    `;
    let textPop = document.querySelector('.marker-text');
    if(!textPop){
      textPop = document.createElement('div');
      textPop.setAttribute('class',"marker-text");
    }
    // textPop.style.display='block';
    textPop.innerHTML = html;
    document.querySelector('.plot-box').appendChild(textPop)

    const box = textPop.querySelector('.add-marker-container');
    box.style.top = (window.innerHeight - rectangle.y < box.offsetHeight ? window.innerHeight - box.offsetHeight : rectangle.y) + 'px';
    box.style.marginLeft=-box.offsetWidth/2+'px';// 水平居中
    if(window.innerWidth - rectangle.x < box.offsetWidth/2) {
      box.style.right = 0;
      box.style.left = 'initial';
    }else{
      box.style.left = (rectangle.x <box.offsetWidth/2?box.offsetWidth/2:rectangle.x) + 'px';
    }
    setTimeout(()=>{
      document.querySelector('#marker-text-value').focus();
    },500)
    box.onclick=e=>{
      this.container = document.querySelector('#marker-text-value').value;
      if (e.target.innerText === '确定' && this.container) {
        this.addDraw = this.addTxt(cartesian);
        this.positions[0] = cartesian;
        if(this.parentNode) {
          // this.parentNode?.drawData?.push(this); //释放添加数据
          this.parentNode?.drawItem()
        }
        callback && callback(this)
      }
      if(['确定','取消'].includes(e.target.innerText)){
        textPop.remove();
        this.onoff = false;
      }
    }
  }
  addTxt(positions) {
    const {textColor,textSize,borderColor} = this.config;
    const model = this.viewer.entities.add({
      name: 'text',
      objId :this.objId,
      id:this.objId,
      position: this.positions[0],
      // point: { // 点
      //   pixelSize: 0,
      //   heightReference: 1000, // 不被山体遮挡
      // },
      label: { // 文字标签
        text: this.container,
        font: `500 ${textSize}px Microsoft YaHei`, // 15pt Helvetica monospace
        scale: 1,
        scaleByDistance: new Cesium.NearFarScalar(2000, 1.0, 800000, 0.01), // 根据相机缩放 2000高度为1，800000时0.01
        // style: Cesium.LabelStyle.FILL,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.fromCssColorString('#fff'|| textColor),
        showBackground: true,
        outlineColor: Cesium.Color.fromCssColorString('#fff'),
        backgroundColor: Cesium.Color.fromCssColorString(borderColor||'#D1210F'),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.MAX_VALUE,
        // backgroundColor: new Cesium.Color(0, 0, 0, 0.5),
      },
    });
    return model;
  } 

  creatDrawPoint(){
    const $this = this;
    const {imgUrl,icon,pointSize,textColor,textSize} = this.config;
    return this.viewer.entities.add({
      objId: $this.objId,
      id:$this.objId,
      position: $this.positions[0],
      desc:$this.config.desc,
      billboard: {
        show: $this.config.show !== false,
        image: imgUrl || icon, // markerImageUrl,
        scale: pointSize,
        scaleByDistance: new Cesium.NearFarScalar(2000, 1.0, 800000, 0.01),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        disableDepthTestDistance: Number.MAX_VALUE,
      },
      label: { // 文字标签
        text: $this.container || $this.config.label,
        font: `500 ${textSize}px Microsoft YaHei`, // 15pt Helvetica monospace
        scale: 1,
        scaleByDistance: new Cesium.NearFarScalar(2000, 1.0, 800000, 0.01), // 根据相机缩放 2000高度为1，800000时0.01
        style: Cesium.LabelStyle.FILL,
        // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.fromCssColorString('#fff'),
        showBackground: true,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.MAX_VALUE,
        backgroundColor: Cesium.Color.fromCssColorString(textColor||'#D1210F'),
        pixelOffset:new Cesium.Cartesian2(0, -25)
      },
    });
  }
  
  creatDrawModel(){
    const $this = this;
    // modeluri
    return this.viewer.entities.add({
      objId: $this.objId,
      id:$this.objId,
      // 模型位置
      position: $this.positions[0],
      // 模型方向
      // orientation: orientation,
      // 模型资源
      model: {
        // 模型路径
        uri: $this.config.modeluri,
        // 模型最小刻度
        minimumPixelSize: 64,
        // 模型最大刻度
        maximumSize: 128,
        // 模型是否可见
        show: $this.config.show !== false,
        // 模型轮廓颜色
        silhouetteColor: Cesium.Color.WHITE,
        // 模型轮廓大小，单位px
        silhouetteSize: 2,
        // 模型颜色
        color: Cesium.Color.CORAL,
      },
      // 添加描述
      description: $this.config.label,
    });
  }
  
  polygonFn(params) {
    let {color,alpha=0.5} = this.config;
    return new Cesium.PolygonGraphics({
      hierarchy: new Cesium.CallbackProperty(()=>new Cesium.PolygonHierarchy(params.callback()), false),
      clampToGround: true,
      fill: true,
      material: Cesium.Color.fromCssColorString(color).withAlpha(alpha),
      disableDepthTestDistance: Number.MAX_VALUE,
      // width,
      outline: false,
    })
  }
  polylineFn(params) {
    let {style,borderSize:width,borderColor,showType} = this.config;
    return {
      positions: new Cesium.CallbackProperty(() => params.callback('line'), false),
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString(borderColor), //轮廓颜色Cesium.Color.YELLOW,
        dashLength: (showType?.includes?.(5) && style=='dashed') ? 20 : 0 //短划线长度
      }),
      width,
      fill: true,
      clampToGround: true,
    }
  }
  creatPincerArrow(){
    const $this = this, entity={};
    let {alpha=0.5,color,borderSize:width,borderColor} = this.config;
    const update = function (type) {
      // 计算面
      if ($this.positions.length < 3) {
        return null;
      }
      const lnglatArr = [];
      for (let i = 0; i < $this.positions.length; i++) {
        const lnglat = $this.cartesianToLatlng($this.positions[i]);
        lnglatArr.push(lnglat);
      }
      const res = xp.algorithm.doubleArrow(lnglatArr);
      let returnData = [];
      const index = JSON.stringify(res.polygonalPoint).indexOf('null');
      if (index == -1) returnData = res.polygonalPoint;
      if(type) returnData.push(returnData[0])
      return returnData;
    };
    entity.polygon = this.polygonFn({callback:update})
    entity.polyline = this.polylineFn({callback:update})
    return this.viewer.entities.add({
      name: "pincerArrow",
      objId: $this.objId,
      id:$this.objId,
      ...entity
    });
  }
  creatAttackArrow(positions) { // 攻击箭头
    const $this = this, entity={};
    let {alpha=0.5,color,borderSize:width,borderColor} = this.config;
    const update = function (type) {
      // return new $this.Cesium.PolygonHierarchy($this._positions);
      if ($this.positions.length < 3) {
        return null;
      }
      const data = [];
      for (let i = 0; i < $this.positions.length; i++) {
        const lnglat = $this.cartesianToLatlng($this.positions[i]);
        data.push(lnglat);
      }
      const res = xp.algorithm.tailedAttackArrow(data);
      const index = JSON.stringify(res.polygonalPoint).indexOf('null');
      let returnData = [];
      if (index == -1) returnData = res.polygonalPoint;
      
      if(type) returnData.push(returnData[0])
      return returnData;
    };
    
    entity.polygon = this.polygonFn({callback:update})
    entity.polyline = this.polylineFn({callback:update})
    return this.viewer.entities.add({
      name: "arrow",
      objId: $this.objId,
      id:$this.objId,
      ...entity
    });
  }
  creatArrow(positions) { // 直线箭头
    const $this = this, entity={};
    let {alpha=0.5,color,borderSize:width,borderColor} = this.config;
    const update = function (type) {
      if ($this.positions.length < 2) {
        return null;
      }
      const p1 = $this.positions[0];
      const p2 = $this.positions[1];
      const firstPoint = $this.cartesianToLatlng(p1);
      const endPoints = $this.cartesianToLatlng(p2);
      const arrow = [];
      const res = xp.algorithm.fineArrow([firstPoint[0], firstPoint[1]], [endPoints[0], endPoints[1]]);
      const index = JSON.stringify(res).indexOf('null');
      if (index != -1) return [];
      for (let i = 0; i < res.length; i++) {
        const c3 = new Cesium.Cartesian3(res[i].x, res[i].y, res[i].z);
        arrow.push(c3);
      }
      if(type) arrow.push(arrow[0])
      return arrow;
    };
    entity.polygon = this.polygonFn({callback:update})
    entity.polyline = this.polylineFn({callback:update})
    return this.viewer.entities.add({
      name: "arrow",
      objId: $this.objId,
      id:$this.objId,
      ...entity
    });
  }
  creatPolygon(positions) { // 多边形
    const $this = this, entity={};
    let {alpha=0.5,color,borderSize:width,borderColor} = this.config;
    function update(type){
      return type == 'line' ? [...$this.positions,$this.positions[0]] : $this.positions;
    }
    entity.polygon = this.polygonFn({callback:update})
    entity.polyline = this.polylineFn({callback:update})
    return this.viewer.entities.add({
      name: "polygon",
      objId: $this.objId,
      id:$this.objId,
      ...entity
    });
  }
  creatRect(positions) { // 矩形
    const $this = this, entity={};
    let {alpha=0.5,color,borderSize:width,borderColor} = this.config;
    width = Number(width)
    function update(){
      const arr = [];
        for (let i = 0; i < $this.positions.length; i++) {
          arr.push($this.cartesianToLatlng($this.positions[i]));
        }
        let posAlonlat = [arr[0],[arr[1][0],arr[0][1]],arr[1],[arr[0][0],arr[1][1]],arr[0]]//.flat();
        return posAlonlat.map(item=>Cesium.Cartesian3.fromDegrees(item[0], item[1]));
    }
    entity.polygon = this.polygonFn({callback:update})
    entity.polyline = this.polylineFn({callback:update})
    return  this.viewer.entities.add({
      name: "rect",
      objId: $this.objId,
      id:$this.objId,
      ...entity
    });
  }
  creatEquilateral(positions) { //等边形
    const $this = this,entity={};
    let {alpha=0.5,color,borderSize:width,borderColor,number=3} = this.config;
    // t：半径
    // e：中心点经纬度坐标[114,22]
    // i： 圆上点的个数，默认6个
    function countCircle(e,t,i=6) {
      for(
        var r = t / 6378137,
            o = [numberToRadius(e[1]), numberToRadius(e[0])],
            s = [],
            a = 0;
        a < i;
        a++
      ) {
        var u = (2 * Math.PI * a) / i;
        var h = Math.asin(
          Math.sin(o[0]) * Math.cos(r) +
          Math.cos(o[0]) * Math.sin(r) * Math.cos(u)
        );
        var c = o[1] + Math.atan2(
            Math.sin(u) * Math.sin(r) * Math.cos(o[0]),
            Math.cos(r) - Math.sin(o[0]) * Math.sin(h)
          );
        s.push([numberToDegree(c), numberToDegree(h)]);
      }
      s.push(s[0]) // 闭合点
      return s;
    }
    function numberToRadius(t) {
      return (t * Math.PI) / 180;
    }
    function numberToDegree(t) {
      return (180 * t) / Math.PI;
    }
    function update(){
      let arr = [];
      for (let i = 0; i < $this.positions.length; i++) {
        const item = $this.cartesianToLatlng($this.positions[i]);
        arr.push(item);
      }
      const r = Math.sqrt(
        Math.pow($this.positions[0].x - $this.positions[$this.positions.length - 1].x, 2) +
        Math.pow($this.positions[0].y - $this.positions[$this.positions.length - 1].y, 2)
      )
      let posArr = countCircle([arr[0][0], arr[0][1]],r,number);
      // console.log(posArr);
      return posArr.map(item=>Cesium.Cartesian3.fromDegrees(item[0],item[1]))
    }
    
    entity.polygon = this.polygonFn({callback:update})
    entity.polyline = this.polylineFn({callback:update})
    return  this.viewer.entities.add({
      name: "equilateral",
      objId: $this.objId,
      id:$this.objId,
      ...entity
    });
  }
  creatEllipse(){ // 椭圆
    const $this = this,entity={};
    const {isFill,color,width} = this.config;
    function getKm(arr1,arr2){ // 获取两点间的距离
      var satrt = Cesium.Cartographic.fromDegrees(arr1[0],arr1[1])
      var end = Cesium.Cartographic.fromDegrees(arr2[0],arr2[1])
      var geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(satrt, end);
      var distance = geodesic.surfaceDistance
      return distance
    }
    function updates(type){
      let arr = [],res;
      for (let i = 0; i <  $this.positions.length; i++) {
        arr.push( $this.cartesianToLatlng($this.positions[i])); // 转换成经纬度
      }
      if(type=='center'){
        const c1 = (arr[0][0] - arr[1][0])/2;
        const c2 = (arr[0][1] - arr[1][1])/2;
        const center = [arr[0][0]+c1,arr[0][1]+c2];
        res = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
      }else{
  //     let posAlonlat = [arr[0],[arr[1][0],arr[0][1]],arr[1],[arr[0][0],arr[1][1]]]
        const r1 = getKm([arr[0][0],arr[0][1]],[arr[1][0],arr[0][1]]) // x
        const r2 = getKm([arr[0][0],arr[0][1]],[arr[0][0],arr[1][1]]) // y
        if(type=='min')  Math.abs(r1) < Math.abs(r2) ? res = Math.abs(r1) : res = Math.abs(r2);
        else if(type=='max') Math.abs(r1) > Math.abs(r2) ? res = Math.abs(r1) : res = Math.abs(r2);
        else if(type=='rotate') {
          // var pitch = Cesium.Math.toDegrees($this.viewer.camera.pitch) y上下
          // var roll =Cesium.Math.toDegrees($this.viewer.camera.roll); x左右

          // Math.abs(r1) < Math.abs(r2) ? res = Cesium.Math.toRadians(90) : res = Cesium.Math.toRadians(0);
          var radian = Math.atan2(arr[0][1] - arr[1][1], arr[0][0] - arr[1][0]); // 返回来的是弧度 
          res = Cesium.Math.toRadians(180 / Math.PI * radian); // 根据弧度计算角度，任意角度
        }
      }
      return res;
    }
    if(isFill==2){
      entity.ellipse = {
        semiMinorAxis: new Cesium.CallbackProperty(() => updates('min'), false),
        semiMajorAxis: new Cesium.CallbackProperty(() => updates('max'), false),
        material:  Cesium.Color.fromCssColorString(color),
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // disableDepthTestDistance: Number.MAX_VALUE,
        rotation: new Cesium.CallbackProperty(() => updates('rotate'), false),
        outlineColor:color,
        outlineWidth:width,
        outline:true,
      }
      
    }else{
      function update(){
        const min = updates('min');
        const max = updates('max');

        let circle = new Cesium.EllipseOutlineGeometry({
          center: $this.positions[0],
          semiMinorAxis: min,
          semiMajorAxis: max,
          rotation: updates('rotate'),
          granularity: 0.01,
        });
        let geometry = Cesium.EllipseOutlineGeometry.createGeometry(circle);
        const positionsArr = geometry.attributes.position.values;//转成数组
        const result = [];
        for(var i=0;i<positionsArr.length;i+=3){
          const rows = positionsArr.slice(i,i+3);
          result.push({x:rows[0],y:rows[1],z:rows[2]})
        }
        return [...result,result[0]];
      }
      entity.polyline = {
        show: $this.config.show !== false,
        positions: new Cesium.CallbackProperty(() => {
          return update()
        }, false),
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString(color), //轮廓颜色Cesium.Color.YELLOW,
          dashLength: isFill==1?20:0 //短划线长度
        }),
        width,
        clampToGround: true,
      }
    }
    return  this.viewer.entities.add({
      position:$this.positions[0], //new Cesium.CallbackProperty(() => update('center')),
      name: "ellipse",
      objId: $this.objId,
      id:$this.objId,
      ...entity
    }); 
  }
  creatCircle2(positions) { //扇形
    const $this = this,entity={};
    const {isFill,color,width} = this.config;
    function computeCirclularFlight(lon, lat, radius) {
      let  Ea = 6378137;      //   赤道半径
      let  Eb = 6356725;      // 极半径 
      let positionArr=[];
      positionArr.push(lon);
      positionArr.push(lat);
      
      let angle = 180;
      //需求正北是0° cesium正东是0°
      for (let i = 0;i <=angle; i++) {
          let dx = radius * Math.sin(i * Math.PI / 180.0);
          let dy = radius * Math.cos(i * Math.PI / 180.0);
          let ec = Eb + (Ea-Eb) * (angle - lat) / angle;
          let ed = ec * Math.cos(lat * Math.PI / 180);
          let BJD = lon + (dx / ed ) * 180.0 / Math.PI;
          let BWD = lat + (dy / ec ) * 180.0 / Math.PI;
          positionArr.push(BJD);
          positionArr.push(BWD);
      }
      return positionArr;
    }
    entity.polygon = {
      hierarchy :  new Cesium.CallbackProperty(() => {
        const r = Math.sqrt(
          Math.pow($this.positions[0].x - $this.positions[$this.positions.length - 1].x, 2) +
            Math.pow($this.positions[0].y - $this.positions[$this.positions.length - 1].y, 2)
        );
        const lnglat = $this.cartesianToLatlng($this.positions[0]);
        return new Cesium.PolygonHierarchy( 
          Cesium.Cartesian3.fromDegreesArray(computeCirclularFlight(lnglat[0], lnglat[1], r))
        )
      }),
      outline : false,
      material : Cesium.Color.fromCssColorString(color),
      disableDepthTestDistance: Number.MAX_VALUE,
    }

    return this.viewer.entities.add({
      position: $this.positions[0],
      objId: $this.objId,
      id:$this.objId,
      name: "扇形",
      ...entity 
    });
  }
  creatCircle(positions,type) { //画圆
    const $this = this,entity={};
    let {alpha=0.5,color,borderSize:width,borderColor} = this.config;
    let radiusHtml = '半径: 0km',entities = null;
    let div = document.querySelector('.plotCircleRadius');//drawCircleRadius
    div.style.opacity = 1;
    if(type!='load'){
      entities = this.viewer.entities.add({
        name: 'text',
        id:'pointRadius',
        position: this.positions[0],
        label: { // 文字标签
          text: radiusHtml,
          font: `500 20px Microsoft YaHei`, // 15pt Helvetica monospace
          style: Cesium.LabelStyle.FILL,
          fillColor: Cesium.Color.fromCssColorString('#fff'),
          showBackground: true,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.MAX_VALUE,
          // backgroundColor: new Cesium.Color(0, 0, 0, 0.8),
          // outlineWidth: 3,
          outlineColor: Cesium.Color.fromCssColorString('#fff'),
          backgroundColor: Cesium.Color.fromCssColorString(borderColor||'#D1210F'),
        },
      });
    }

    function update(){
      let r = 0
      if($this.isChange && $this.config.radius){
        r = Number($this.config.radius);
      }else{
        r = Math.sqrt(
          Math.pow($this.positions[0].x - $this.positions[$this.positions.length - 1].x, 2) +
            Math.pow($this.positions[0].y - $this.positions[$this.positions.length - 1].y, 2)
        );
        $this.config.radius = r.toFixed(2);
      }
      radiusHtml = `半径: ${(r/1000).toFixed(2)}km`;
      if(type!='load') entities.label.text.setValue(radiusHtml);

      let circle = new Cesium.CircleOutlineGeometry({
        center: $this.positions[0],
        radius: r || r + 1,
        granularity: 0.01
      });
      let geometry = Cesium.CircleOutlineGeometry.createGeometry(circle);
      const positionsArr = geometry.attributes.position.values;//转成数组
      const result = [];
      for(var i=0;i<positionsArr.length;i+=3){
        const rows = positionsArr.slice(i,i+3);
        result.push({x:rows[0],y:rows[1],z:rows[2]})
      }
      return [...result,result[0]];
    }
    
    entity.polygon = this.polygonFn({callback:update})
    entity.polyline = this.polylineFn({callback:update})
    return this.viewer.entities.add({
      position:$this.positions[0],
      objId: $this.objId,
      id:$this.objId,
      isSearch:true,
      name: "circle",
      ...entity 
    });
    
  }
  creatLine(positions) { //画线
    const $this = this,entity={};
    const {alpha=0.5,borderColor:color,borderSize:width,type,style,show} = this.config;
    function updateArbitrarily(){
      return [...$this.positions,$this.positions[0]];
    }
    function update(){
      return $this.positions;
    }
    if(type == 'arbitrarily'){
      if(this.positions.length>2){
        entity.polygon = this.polygonFn({callback:updateArbitrarily})
      }
      entity.polyline = this.polylineFn({callback:updateArbitrarily})
    }else{
      entity.polyline = this.polylineFn({callback:update})
    }
    return this.viewer.entities.add({
      name: "pen",
      objId: $this.objId,
      id:$this.objId,
      ...entity
    });
  }
  creatFlowLine(){ // 流动线条 需加载[materialLine]插件
    const $this = this;
    const {isFill,color,width} = this.config; 
    return this.viewer.entities.add({
      name: "flowLine",
      objId: $this.objId,
      id:$this.objId,
      polyline:{
        show: $this.config.show !== false,
        positions: new Cesium.CallbackProperty(() => {
          return this.config.type == 'arbitrarily'? [...$this.positions,$this.positions[0]] : $this.positions;
        }, false),
        material: new Cesium.CustomMaterialLine({// 流动线条
          image: "/src/assets/img/liuxing.png",
          color,
          duration: 1500,
        }),
        width,
        fill: true,
        clampToGround: true,
      }
    })
  }
  creatPoint(positions) { // 画点
    var point = viewer.entities.add({
      position: positions,
      point: {
        color: Cesium.Color.WHITE,
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.MAX_VALUE,
      },
    });
    return point;
    }
  /* 计算两点之间的距离 */
  getDistance (satrt, end) {
    var geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(satrt, end);
    var distance = geodesic.surfaceDistance
    return distance
  }
  creatByData( data = { position: [[]]}) {
    if (!data.position[0] || !data.position[0][0] || !data.config) return;
    this.positions = [];
    data.position.forEach(item=>{
      let cartesian = Cesium.Cartesian3.fromDegrees(item[0], item[1]) // 经纬度转笛卡尔
      this.positions.push(cartesian);
      // this.firstPoint = this.creatPoint(cartesian);
      // this.firstPoint.type = 'firstPoint';
    })
    this.container = data.name;
    // 构建控制点
    this.drawAll({},'load');
  }
  save() {
    let arr = [],name,desc,radius;
    for (let i = 0; i < this.positions.length; i++) {
      const item = this.cartesianToLatlng(this.positions[i]);
      arr.push(item);
    }
    // if(['text','drawPoint'].includes(this.config.type)) 
    name = this.container;
    desc = this.config.desc;
    // radius = this.config.radius;
    return { position: arr, config:this.config,objId:this.objId,name,desc};
  }
  clear(data={}) {
    if (data && data.addDraw) {
      this.viewer.entities.remove(data.addDraw);
      data.addDraw = null;
    }else{
      if(data.objId){
        const entities = this.viewer.entities;
        const entity = entities.getById(data.objId);
        entity?._children?.forEach((child,index) => {
            entities.remove(child);
        })
        entities.removeById(data.objId);
      }
    }
    this.positions = [];
  }
  cartesianToLatlng(cartesian) { // 笛卡尔转经纬度
    const latlng = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    const lat = Cesium.Math.toDegrees(latlng.latitude); // 纬度
    const lng = Cesium.Math.toDegrees(latlng.longitude); // 经度
    const alt = latlng.height;
    return [lng, lat];
  }
  getCatesian3FromPX(px, viewer) { //屏幕坐标转笛卡尔
		// const picks = viewer.scene.drillPick(px);
		// let cartesian = null;
		// let isOn3dtiles = false;
		// for (let i = 0; i < picks.length; i++) {
		// 	if ((picks[i] && picks[i].primitive) || picks[i] instanceof Cesium.Cesium3DTileFeature) { // 模型上拾取
		// 		isOn3dtiles = true;
		// 	}
		// }
		// if (isOn3dtiles ) { // 
		// 	cartesian = viewer.scene.pickPosition(px);
		// } else {
		// 	const ray = viewer.camera.getPickRay(px);
		// 	if (!ray) return null;
		// 	cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    //   console.log(cartesian,"====");
    // }
		let cartesian = null;
    const ray = viewer.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    return cartesian;
	}
  //空间两点距离计算函数
  getSpaceDistance(positions) {
    var distance = 0;
    for (var i = 0; i < positions.length - 1; i++) { 
      var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
      var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i+1]);
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      var s = geodesic.surfaceDistance;
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));	
      distance = distance + s;
    }	
    return distance.toFixed(2);    
  }
}
