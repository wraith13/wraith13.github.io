var pass_through;
var phi = 1.618033988749894848204586834365;
var rgbForStyle = function (expression) {
    var toHex = function (i) {
        var result = ((255 * i) ^ 0).toString(16).toUpperCase();
        if (1 === result.length) {
            result = "0" + result;
        }
        return result;
    };
    return "#"
        + toHex(expression.r)
        + toHex(expression.g)
        + toHex(expression.b);
};
var xyzToLength = function (xyz) { return Math.sqrt(Math.pow(xyz.x, 2) + Math.pow(xyz.y, 2) + Math.pow(xyz.z, 2)); };
var rgbToXyz = function (expression) { return pass_through = { x: expression.r, y: expression.g, z: expression.b }; };
var rgbToHue = function (expression) {
    var hueXy = {
        x: Math.sqrt(Math.pow(expression.g, 2) - Math.pow(expression.g / 2, 2))
            - Math.sqrt(Math.pow(expression.b, 2) - Math.pow(expression.b / 2, 2)),
        y: (expression.g / 2) + (expression.b / 2) - expression.r
    };
    return -Math.atan2(hueXy.y, hueXy.x);
};
var rgbToLightness = function (expression) { return xyzToLength(rgbToXyz(expression)); };
var rgbToSaturation = function (expression) {
    var lightness = rgbToLightness(expression);
    return xyzToLength({ x: expression.r - lightness, y: expression.g - lightness, z: expression.b - lightness });
};
var rgbToHsl = function (expression) { return pass_through =
    //	※座標空間敵に RGB 色空間の立方体の座標として捉えるので、本来であれば円筒形あるいは双円錐形の座標となる HLS (および HSV とも)厳密には異なるが、ここでは便宜上 HLS と呼称する。
    {
        h: rgbToHue(expression),
        s: rgbToSaturation(expression),
        l: rgbToLightness(expression)
    }; };
var hslToRgb = function (expression) {
    //	※座標空間敵に RGB 色空間の立方体の座標として捉えるので、本来であれば円筒形あるいは双円錐形の座標となる HLS (および HSV とも)厳密には異なるが、ここでは便宜上 HLS と呼称する。
    var result = {
        r: expression.s * Math.sin(expression.h),
        g: expression.s * Math.sin(expression.h + (Math.PI / 3.0)),
        b: expression.s * Math.sin(expression.h - (Math.PI / 3.0))
    };
    var maxLightness = xyzToLength({ x: 1.0, y: 1.0, z: 1.0 });
    var baseLightness = rgbToLightness(result);
    result.r += (expression.l - baseLightness) / maxLightness;
    result.g += (expression.l - baseLightness) / maxLightness;
    result.b += (expression.l - baseLightness) / maxLightness;
    return result;
};
//# sourceMappingURL=color.js.map