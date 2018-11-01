let pass_through;
let phi = 1.618033988749895;

interface ColorRgb
{
    r : number; // min:0.0, max:1.0
    g : number; // min:0.0, max:1.0
    b : number; // min:0.0, max:1.0
}
//	※座標空間的に RGB 色空間立方体の座標として捉えるので、本来であれば円筒形あるいは双円錐形の座標となる HLS (および HSV とも)厳密には異なるが、ここでは便宜上 HLS と呼称する。
interface ColorHsl
{
    h : number; // min:-Math.PI, max:Math.PI
    s : number; // min:0.0, max:Math,Pow(calcSaturation({r:1.0, g:0.0, b:0.0}), 2) === 2.0/3.0
    l : number; // min:0.0, max:1.0
}
const colorHslHMin = -Math.PI;
const colorHslHMAx = Math.PI;
const colorHslSMin = 0.0;
const colorHslSMAx = 2.0 / 3.0;
const colorHslLMin = 0.0;
const colorHslLMAx = 1.0;
interface Point3d
{
    x : number;
    y : number;
    z : number;
}
const rgbForStyle = function(expression: ColorRgb)
{
    const toHex = (i : number) : string => {
        let result = ((255 *i) ^ 0).toString(16).toUpperCase();
        if (1 === result.length) {
            result = "0" +result;
        }
        return result;
    };
    return "#"
            +toHex(expression.r)
            +toHex(expression.g)
            +toHex(expression.b)
    ;
};
const rgbFromStyle = function(style : string) : ColorRgb
{
    let r = 0.0;
    let g = 0.0;
    let b = 0.0;
    while("#" === style.substr(0,1))
    {
        style = style.substr(1);
    }
    if (3 === style.length)
    {
        r = (parseInt(style.substr(0,1), 16) *0x11) /255.0;
        g = (parseInt(style.substr(1,1), 16) *0x11) /255.0;
        b = (parseInt(style.substr(2,1), 16) *0x11) /255.0;
    }
    if (6 === style.length)
    {
        r = parseInt(style.substr(0,2), 16) /255.0;
        g = parseInt(style.substr(2,2), 16) /255.0;
        b = parseInt(style.substr(4,2), 16) /255.0;
    }
    return {r, g, b};
};
const xyzToLength = (xyz : Point3d) : number => Math.sqrt(Math.pow(xyz.x, 2) +Math.pow(xyz.y, 2) +Math.pow(xyz.z, 2));
const rgbToXyz = (expression : ColorRgb) : Point3d => pass_through = {x:expression.r, y:expression.g, z:expression.b};
const rgbToHue = (expression : ColorRgb) => {
    const hueXy = {
        x: expression.r -((expression.g /2) +(expression.b /2)),
        y: Math.sqrt(Math.pow(expression.b, 2) -Math.pow(expression.b /2, 2))
            -Math.sqrt(Math.pow(expression.g, 2) -Math.pow(expression.g /2, 2))
    };
    return Math.atan2(hueXy.y, hueXy.x);
};
const rgbToLightness = (expression : ColorRgb) : number => (expression.r +expression.g +expression.b) /3.0;
const calcSaturation = (expression : ColorRgb) : number => {
    const lightness = rgbToLightness(expression);
    return xyzToLength({x:expression.r -lightness, y:expression.g -lightness, z:expression.b -lightness});
};
const rgbToSaturation = (expression : ColorRgb) : number => calcSaturation(expression) *calcSaturation({r:1.0, g:0.0, b:0.0});
const rgbToHsl = (expression : ColorRgb) : ColorHsl => pass_through =
{
    h: rgbToHue(expression),
    s: rgbToSaturation(expression),
    l: rgbToLightness(expression)
};
const hslToRgbElement = (expression : ColorHsl, colorAngle : number) : number => expression.l +expression.s *Math.cos(expression.h +(Math.PI *2) /3.0 *colorAngle);
const hslToRgb = (expression : ColorHsl) : ColorRgb => pass_through =
{
    r:hslToRgbElement(expression, 0.0),
    g:hslToRgbElement(expression, 1.0),
    b:hslToRgbElement(expression, 2.0)
};
const regulateHue = (expression : ColorHsl) : ColorHsl =>
{
    let h = expression.h;
    while(h < -Math.PI)
    {
        h += Math.PI *2;
    }
    while(Math.PI < h)
    {
        h -= Math.PI *2;
    }
    return pass_through =
    {
        h: h,
        s: expression.s,
        l: expression.l,
    };
};
const clipLightness = (expression : ColorHsl) : ColorHsl => pass_through =
{
    h: expression.h,
    s: expression.s,
    l: Math.max(0.0, Math.min(1.0, expression.l)),
};
const clipSaturation = (expression : ColorHsl) : ColorHsl =>
{
    const rgb = hslToRgb(expression);
    const overRate = Math.max
    (
        (rgb.r < 0.0) ? (expression.l -rgb.r) / expression.l:
        (1.0 < rgb.r) ? (rgb.r -expression.l) / (1.0 -expression.l):
        1.0,

        (rgb.g < 0.0) ? (expression.l -rgb.g) / expression.l:
        (1.0 < rgb.g) ? (rgb.g -expression.l) / (1.0 -expression.l):
        1.0,

        (rgb.b < 0.0) ? (expression.l -rgb.b) / expression.l:
        (1.0 < rgb.b) ? (rgb.b -expression.l) / (1.0 -expression.l):
        1.0,
    );
    return pass_through =
    {
        h: expression.h,
        s: expression.s / overRate,
        l: expression.l,
    };
};
const regulateHsl = (expression : ColorHsl) : ColorHsl => clipSaturation(clipLightness(regulateHue(expression)));
const clipRgb = (expression : ColorRgb) : ColorRgb => pass_through =
{
    r: Math.max(0.0, Math.min(1.0, expression.r)),
    g: Math.max(0.0, Math.min(1.0, expression.g)),
    b: Math.max(0.0, Math.min(1.0, expression.b)),
};

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
