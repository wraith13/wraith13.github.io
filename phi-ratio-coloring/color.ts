let pass_through;
let phi = 1.618033988749894848204586834365;

interface ColorRgb
{
    r : number; // min:0.0, max:1.0
    g : number; // min:0.0, max:1.0
    b : number; // min:0.0, max:1.0
}
interface ColorHsl
{
    h : number; // min:-Math.PI, max:Math.PI
    s : number; // min:0.0, max:Math,Pow(calcSaturation({r:1.0, g:0.0, b:0.0}), 2) === 2.0/3.0
    l : number; // min:0.0, max:1.0
}
interface Point3d
{
    x : number;
    y : number;
    z : number;
}
const rgbForStyle = function(expression: ColorRgb) {
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
const xyzToLength = (xyz : Point3d) : number => Math.sqrt(Math.pow(xyz.x, 2) +Math.pow(xyz.y, 2) +Math.pow(xyz.z, 2));
const rgbToXyz = (expression : ColorRgb) : Point3d => pass_through = {x:expression.r, y:expression.g, z:expression.b};

const rgbToHue = (expression : ColorRgb) => {
    const hueXy = {
        x: expression.r -((expression.g /2) +(expression.b /2)),
        y: Math.sqrt(Math.pow(expression.g, 2) -Math.pow(expression.g /2, 2))
            -Math.sqrt(Math.pow(expression.b, 2) -Math.pow(expression.b /2, 2))
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
    //	※座標空間敵に RGB 色空間の立方体の座標として捉えるので、本来であれば円筒形あるいは双円錐形の座標となる HLS (および HSV とも)厳密には異なるが、ここでは便宜上 HLS と呼称する。
    {
        h: rgbToHue(expression),
        s: rgbToSaturation(expression),
        l: rgbToLightness(expression)
    };
const hslToRgb = (expression : ColorHsl) : ColorRgb => {
    //	※座標空間敵に RGB 色空間の立方体の座標として捉えるので、本来であれば円筒形あるいは双円錐形の座標となる HLS (および HSV とも)厳密には異なるが、ここでは便宜上 HLS と呼称する。
    return pass_through =
    {
         r:expression.l +expression.s *Math.cos(expression.h),
         g:expression.l +expression.s *Math.cos(expression.h -((Math.PI *2) /3.0)),
         b:expression.l +expression.s *Math.cos(expression.h +((Math.PI *2) /3.0))
    };
};

/*
const test = () =>
{
    console.log("rgbToHsl({r:0.0,g:0.0,b:0.0})", rgbToHsl({r:0.0,g:0.0,b:0.0}));
    console.log("rgbToHsl({r:1.0,g:0.0,b:0.0})", rgbToHsl({r:1.0,g:0.0,b:0.0}));
    console.log("rgbToHsl({r:1.0,g:1.0,b:0.0})", rgbToHsl({r:1.0,g:1.0,b:0.0}));
    console.log("rgbToHsl({r:1.0,g:1.0,b:1.0})", rgbToHsl({r:1.0,g:1.0,b:1.0}));
    console.log("rgbToHsl({r:0.5,g:0.5,b:0.5})", rgbToHsl({r:0.5,g:0.5,b:0.5}));
    console.log("rgbToHsl({r:0.1,g:0.0,b:0.0})", rgbToHsl({r:0.1,g:0.0,b:0.0}));
    console.log("rgbToHsl({r:0.1,g:0.1,b:0.0})", rgbToHsl({r:0.1,g:0.1,b:0.0}));
    console.log("rgbToHsl({r:0.9,g:0.0,b:0.0})", rgbToHsl({r:0.9,g:0.0,b:0.0}));
    console.log("rgbToHsl({r:0.9,g:0.9,b:0.0})", rgbToHsl({r:0.9,g:0.9,b:0.0}));
    console.log("hslToRgb(rgbToHsl({r:0.0,g:0.0,b:0.0}))", hslToRgb(rgbToHsl({r:0.0,g:0.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:1.0,g:0.0,b:0.0}))", hslToRgb(rgbToHsl({r:1.0,g:0.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:1.0,g:1.0,b:0.0}))", hslToRgb(rgbToHsl({r:1.0,g:1.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:1.0,g:1.0,b:1.0}))", hslToRgb(rgbToHsl({r:1.0,g:1.0,b:1.0})));
    console.log("hslToRgb(rgbToHsl({r:0.5,g:0.5,b:0.5}))", hslToRgb(rgbToHsl({r:0.5,g:0.5,b:0.5})));
    console.log("hslToRgb(rgbToHsl({r:0.1,g:0.0,b:0.0}))", hslToRgb(rgbToHsl({r:0.1,g:0.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:0.1,g:0.1,b:0.0}))", hslToRgb(rgbToHsl({r:0.1,g:0.1,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:0.9,g:0.0,b:0.0}))", hslToRgb(rgbToHsl({r:0.9,g:0.0,b:0.0})));
    console.log("hslToRgb(rgbToHsl({r:0.9,g:0.9,b:0.0}))", hslToRgb(rgbToHsl({r:0.9,g:0.9,b:0.0})));
};
test();
*/
