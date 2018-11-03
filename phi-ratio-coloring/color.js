var pass_through;
var phi = 1.618033988749895;
var colorHslHMin = -Math.PI;
var colorHslHMAx = Math.PI;
var colorHslSMin = 0.0;
var colorHslSMAx = 2.0 / 3.0;
var colorHslLMin = 0.0;
var colorHslLMAx = 1.0;
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
var rgbFromStyle = function (style) {
    var r = 0.0;
    var g = 0.0;
    var b = 0.0;
    while ("#" === style.substr(0, 1)) {
        style = style.substr(1);
    }
    if (3 === style.length) {
        r = (parseInt(style.substr(0, 1), 16) * 0x11) / 255.0;
        g = (parseInt(style.substr(1, 1), 16) * 0x11) / 255.0;
        b = (parseInt(style.substr(2, 1), 16) * 0x11) / 255.0;
    }
    if (6 === style.length) {
        r = parseInt(style.substr(0, 2), 16) / 255.0;
        g = parseInt(style.substr(2, 2), 16) / 255.0;
        b = parseInt(style.substr(4, 2), 16) / 255.0;
    }
    return { r: r, g: g, b: b };
};
var xyzToLength = function (xyz) { return Math.sqrt(Math.pow(xyz.x, 2) + Math.pow(xyz.y, 2) + Math.pow(xyz.z, 2)); };
var rgbToXyz = function (expression) { return pass_through = { x: expression.r, y: expression.g, z: expression.b }; };
var rgbToHue = function (expression) {
    var hueXy = {
        x: expression.r - ((expression.g / 2) + (expression.b / 2)),
        y: Math.sqrt(Math.pow(expression.g, 2) - Math.pow(expression.g / 2, 2))
            - Math.sqrt(Math.pow(expression.b, 2) - Math.pow(expression.b / 2, 2))
    };
    return Math.atan2(hueXy.y, hueXy.x);
};
var rgbToLightness = function (expression) { return (expression.r + expression.g + expression.b) / 3.0; };
var calcSaturation = function (expression) {
    var lightness = rgbToLightness(expression);
    return xyzToLength({ x: expression.r - lightness, y: expression.g - lightness, z: expression.b - lightness });
};
var rgbToSaturation = function (expression) { return calcSaturation(expression) * calcSaturation({ r: 1.0, g: 0.0, b: 0.0 }); };
var rgbToHsl = function (expression) { return pass_through =
    {
        h: rgbToHue(expression),
        s: rgbToSaturation(expression),
        l: rgbToLightness(expression)
    }; };
var hslToRgbElement = function (expression, colorAngle) { return expression.l + expression.s * Math.cos(expression.h - (Math.PI * 2) / 3.0 * colorAngle); };
var hslToRgb = function (expression) { return pass_through =
    {
        r: hslToRgbElement(expression, 0.0),
        g: hslToRgbElement(expression, 1.0),
        b: hslToRgbElement(expression, 2.0)
    }; };
var regulateHue = function (expression) {
    var h = expression.h;
    while (h < -Math.PI) {
        h += Math.PI * 2;
    }
    while (Math.PI < h) {
        h -= Math.PI * 2;
    }
    return pass_through =
        {
            h: h,
            s: expression.s,
            l: expression.l,
        };
};
var clipLightness = function (expression) { return pass_through =
    {
        h: expression.h,
        s: expression.s,
        l: Math.max(0.0, Math.min(1.0, expression.l)),
    }; };
var clipSaturation = function (expression) {
    var rgb = hslToRgb(expression);
    var overRate = Math.max((rgb.r < 0.0) ? (expression.l - rgb.r) / expression.l :
        (1.0 < rgb.r) ? (rgb.r - expression.l) / (1.0 - expression.l) :
            1.0, (rgb.g < 0.0) ? (expression.l - rgb.g) / expression.l :
        (1.0 < rgb.g) ? (rgb.g - expression.l) / (1.0 - expression.l) :
            1.0, (rgb.b < 0.0) ? (expression.l - rgb.b) / expression.l :
        (1.0 < rgb.b) ? (rgb.b - expression.l) / (1.0 - expression.l) :
            1.0);
    return pass_through =
        {
            h: expression.h,
            s: expression.s / overRate,
            l: expression.l,
        };
};
var regulateHsl = function (expression) { return clipSaturation(clipLightness(regulateHue(expression))); };
var clipRgb = function (expression) { return pass_through =
    {
        r: Math.max(0.0, Math.min(1.0, expression.r)),
        g: Math.max(0.0, Math.min(1.0, expression.g)),
        b: Math.max(0.0, Math.min(1.0, expression.b)),
    }; };
/*
const test = () =>
{
    console.log("rgbToHsl({r:0.0,g:0.0,b:0.0})", rgbToHsl({r:0.0,g:0.0,b:0.0}));
    console.log("rgbToHsl({r:1.0,g:0.0,b:0.0})", rgbToHsl({r:1.0,g:0.0,b:0.0}));
    console.log("rgbToHsl({r:0.0,g:1.0,b:0.0})", rgbToHsl({r:0.0,g:1.0,b:0.0}));
    console.log("rgbToHsl({r:0.0,g:0.0,b:1.0})", rgbToHsl({r:0.0,g:0.0,b:1.0}));
    console.log("rgbToHsl({r:1.0,g:1.0,b:0.0})", rgbToHsl({r:1.0,g:1.0,b:0.0}));
    console.log("rgbToHsl({r:1.0,g:1.0,b:1.0})", rgbToHsl({r:1.0,g:1.0,b:1.0}));
    console.log("rgbToHsl({r:0.5,g:0.5,b:0.5})", rgbToHsl({r:0.5,g:0.5,b:0.5}));
    console.log("rgbToHsl({r:0.1,g:0.0,b:0.0})", rgbToHsl({r:0.1,g:0.0,b:0.0}));
    console.log("rgbToHsl({r:0.1,g:0.1,b:0.0})", rgbToHsl({r:0.1,g:0.1,b:0.0}));
    console.log("rgbToHsl({r:0.9,g:0.0,b:0.0})", rgbToHsl({r:0.9,g:0.0,b:0.0}));
    console.log("rgbToHsl({r:0.9,g:0.9,b:0.0})", rgbToHsl({r:0.9,g:0.9,b:0.0}));
    console.log("hslToRgb(rgbToHsl({r:0.0,g:0.0,b:0.0}))", hslToRgb(rgbToHsl({r:0.0,g:0.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:1.0,g:0.0,b:0.0}))", hslToRgb(rgbToHsl({r:1.0,g:0.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:0.0,g:1.0,b:0.0}))", hslToRgb(rgbToHsl({r:0.0,g:1.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:0.0,g:0.0,b:1.0}))", hslToRgb(rgbToHsl({r:0.0,g:0.0,b:1.0})));
    console.log("hslToRgb(rgbToHsl({r:1.0,g:1.0,b:0.0}))", hslToRgb(rgbToHsl({r:1.0,g:1.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:1.0,g:1.0,b:1.0}))", hslToRgb(rgbToHsl({r:1.0,g:1.0,b:1.0})));
    console.log("hslToRgb(rgbToHsl({r:0.5,g:0.5,b:0.5}))", hslToRgb(rgbToHsl({r:0.5,g:0.5,b:0.5})));
    console.log("hslToRgb(rgbToHsl({r:0.1,g:0.0,b:0.0}))", hslToRgb(rgbToHsl({r:0.1,g:0.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:0.1,g:0.1,b:0.0}))", hslToRgb(rgbToHsl({r:0.1,g:0.1,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:0.9,g:0.0,b:0.0}))", hslToRgb(rgbToHsl({r:0.9,g:0.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:0.9,g:0.9,b:0.0}))", hslToRgb(rgbToHsl({r:0.9,g:0.9,b:0.0})));
};
test();
//*/
//# sourceMappingURL=color.js.map