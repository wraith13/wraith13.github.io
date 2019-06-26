import * as octiconsSource from "../node_modules/@primer/octicons/build/data.json";
export interface Figma
{
    id: string;
    file: string;
}
export interface Options
{
    "version": string;
    "width": number;
    "height": number;
    "viewBox": string;
    "class": string;
    "aria-hidden": string;
}
export interface Octicon
{
    name: string;
    figma: Figma,
    keywords: string[],
    width: number;
    height: number;
    path: string;
    symbol: string;
    options: Options;
    toSVG: () => string;
}
export const octicons = <{ [key in keyof typeof octiconsSource]:Octicon }>require("@primer/octicons");
export default octicons;
