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
        const toast = async (text: string) =>
        {
            const message = minamo.dom.make(HTMLDivElement)
            ({
                parent: document.body,
                className: "toast",
                children: text,
            });
            await minamo.core.timeout(3000);
            message.classList.add("slide-out");
            await minamo.core.timeout(500);
            document.body.removeChild(message);
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
    };
}
