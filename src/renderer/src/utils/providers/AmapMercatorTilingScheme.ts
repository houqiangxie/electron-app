import CoordTransform from './CoordTransform';
const Math = Cesium.Math
class AmapMercatorTilingScheme extends Cesium.WebMercatorTilingScheme {
    _projection: any={};

    constructor() {
        super();

        let projection = new Cesium.WebMercatorProjection();

        this._projection.project = function (cartographic: any, result: any) {
            result = CoordTransform.WGS84ToGCJ02(
                Math.toDegrees(cartographic.longitude),
                Math.toDegrees(cartographic.latitude)
            );
            result = projection.project(new Cesium.Cartographic(Math.toRadians(result[0]), Math.toRadians(result[1])));
            return new Cesium.Cartesian2(result.x, result.y);
        };

        this._projection.unproject = function (cartesian: any, result: any) {
            let cartographic = projection.unproject(cartesian);
            result = CoordTransform.GCJ02ToWGS84(
                Math.toDegrees(cartographic.longitude),
                Math.toDegrees(cartographic.latitude)
            );
            return new Cesium.Cartographic(Math.toRadians(result[0]), Math.toRadians(result[1]));
        };
    }
}

export default AmapMercatorTilingScheme;
