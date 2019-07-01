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
        const filter = minamo.dom.make(HTMLInputElement)
        (
            {
                className: "filter",
                placeholder: "filter",
                oninput: () =>
                {
                    const value = filter.value.trim().toLowerCase();
                    Array.from(document.getElementsByTagName("li")).forEach
                    (
                        i => i.style.display = 0 <= i.innerText.indexOf(value) ?
                            "flex":
                            "none"
                    );
                }
            }
        );
        const toast = (_text: string) =>
        {

        };
        const copy = (text: string) =>
        {
            const pre = minamo.dom.make(HTMLPreElement)
            ({
                children: text,
            });
            document.body.appendChild(pre);
            document.getSelection().selectAllChildren(pre);
            document.execCommand("copy");
            document.body.removeChild(pre);
            toast(`Copied "${text}" to the clipboard.`);
        };

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
                        filter,
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
                                onclick: () => copy(i),
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
