# typed-octicons

`typed-octicons` is a typed wrapper of [GitHub Octicons](https://www.npmjs.com/package/@primer/octicons) for TypeScript.

## Install

```
$ npm install typed-octicons --save
```

## How to use

```typescript
import octicons from "typed-octicons";

const svg: string = octicons.bell.toSVG();
console.log(svg); // <svg version="1.1" width="14" height="16" viewBox="0 0 14 16" class="octicon octicon-bell" aria-hidden="true"><path fill-rule="evenodd" d="M14 12v1H0v-1l.73-.58c.77-.77.81-2.55 1.19-4.42C2.69 3.23 6 2 6 2c0-.55.45-1 1-1s1 .45 1 1c0 0 3.39 1.23 4.16 5 .38 1.88.42 3.66 1.19 4.42l.66.58H14zm-7 4c1.11 0 2-.89 2-2H5c0 1.11.89 2 2 2z"/></svg>

const makeOcticonSVG = (octicon: Octicon | keyof typeof octicons): SVGElement =>
{
    const div = document.createElement("div");
    div.innerHTML =
        (
            "string" === typeof octicon ?
                octicons[octicon]:
                octicon
        )
        .toSVG();
    return <SVGElement>div.firstChild;
};

document.body.appendChild(makeOcticonSVG(octicons.bell));
document.body.appendChild(makeOcticonSVG("bell"));
```

## How to build

requires: [Node.js](https://nodejs.org/), [TypeScript Compiler](https://www.npmjs.com/package/typescript)

`tsc -P .` or `tsc -P . -w`

### In VS Code

You can use automatic build. Run `Tasks: Allow Automatic Tasks in Folder` command from command palette ( Mac: <kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>P</kbd>, Windows and Linux: <kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>P</kbd>), and restart VS Code.

## License

[Boost Software License](./LICENSE_1_0.txt)
