import { minamo } from "./minamo.js";
import octicons, { Octicon } from "typed-octicons";

export module test
{
    const makeHeading = (tag: string, text: string) =>
    (
        {
            tag,
            children: text,
        }
    );
    const makeOcticonSVG = (octicon: Octicon | keyof typeof octicons): SVGElement =>
    {
        const div = document.createElement("div");
        div.innerHTML =
            (
                "string" === typeof octicon ?
                    octicons[octicon]:
                    octicon
            )
            .toSVG()
            .replace(/ width=\"(.*?)\" /, " ")
            .replace(/ height=\"(.*?)\" /, " ");
        return <SVGElement>div.firstChild;
    };
    const renderOction = (key: keyof typeof octicons) =>
    [
        makeOcticonSVG(key),
        {
            tag: "span",
            children: key
        },
    ];
    export const start = async (): Promise<void> =>
    {
        minamo.dom.appendChildren
        (
            document.body,
            [
                makeHeading("h1", document.title),
                {
                    tag: "p",
                    children:
                    [
                        //"description...",
                        {
                            tag: "a",
                            className: "github",
                            href: "https://github.com/wraith13/wraith13.github.io/tree/master/octicons",
                            children: makeOcticonSVG(octicons["logo-github"]),
                        },
                    ],
                },
                {
                    tag: "ul",
                    children: Object.keys(octicons)
                        .filter(i => "default" !== i) // evil-commonjs のバグ且つ仕様で default が生えてしまう
                        .map
                        (
                            i =>
                            ({
                                tag: "li",
                                children: renderOction(<keyof typeof octicons>i),
                            })
                        ),
                },
            ]
        );
        setTimeout
        (
            ()=>
            {
                const hashRaw = minamo.core.separate(location.href, "#").tail;
                if (hashRaw)
                {
                    const hash = decodeURIComponent(hashRaw);
                    const target = <HTMLElement>Array.from(document.body.children).filter(i => i.textContent === hash)[0];
                    if (target)
                    {
                        document.body.scrollTop = target.offsetTop;
                    }
                    else
                    {
                        console.error(`Not found hash ${hash}`);
                    }
                }
            },
            0
        );
    };
}
