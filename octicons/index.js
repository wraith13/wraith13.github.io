"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var minamo_js_1 = require("./minamo.js");
var typed_octicons_1 = require("typed-octicons");
var catalog;
(function (catalog) {
    var _this = this;
    var makeHeading = function (tag, text) {
        return ({
            tag: tag,
            children: text,
        });
    };
    var makeOcticonSVG = function (octicon) {
        var div = document.createElement("div");
        div.innerHTML =
            ("string" === typeof octicon ?
                typed_octicons_1.default[octicon] :
                octicon)
                .toSVG()
                .replace(/ width=\"(.*?)\" /, " ")
                .replace(/ height=\"(.*?)\" /, " ");
        return div.firstChild;
    };
    var renderOction = function (key) {
        return [
            makeOcticonSVG(key),
            {
                tag: "span",
                children: key
            },
        ];
    };
    catalog.start = function () { return __awaiter(_this, void 0, void 0, function () {
        var filter, toast, copy;
        var _this = this;
        return __generator(this, function (_a) {
            filter = minamo_js_1.minamo.dom.make(HTMLInputElement)({
                className: "filter",
                placeholder: "filter",
                oninput: function () {
                    var value = filter.value.trim().toLowerCase();
                    Array.from(document.getElementsByTagName("li")).forEach(function (i) { return i.style.display = 0 <= i.innerText.indexOf(value) ?
                        "flex" :
                        "none"; });
                }
            });
            toast = function (text) { return __awaiter(_this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = minamo_js_1.minamo.dom.make(HTMLDivElement)({
                                parent: document.body,
                                className: "toast",
                                children: text,
                            });
                            return [4 /*yield*/, minamo_js_1.minamo.core.timeout(3000)];
                        case 1:
                            _a.sent();
                            message.classList.add("slide-out");
                            return [4 /*yield*/, minamo_js_1.minamo.core.timeout(500)];
                        case 2:
                            _a.sent();
                            document.body.removeChild(message);
                            return [2 /*return*/];
                    }
                });
            }); };
            copy = function (text) {
                var pre = minamo_js_1.minamo.dom.make(HTMLPreElement)({
                    children: text,
                });
                document.body.appendChild(pre);
                document.getSelection().selectAllChildren(pre);
                document.execCommand("copy");
                document.body.removeChild(pre);
                toast("Copied \"" + text + "\" to the clipboard.");
            };
            minamo_js_1.minamo.dom.appendChildren(document.body, [
                makeHeading("h1", document.title),
                {
                    tag: "p",
                    children: [
                        //"description...",
                        {
                            tag: "a",
                            className: "github",
                            href: "https://github.com/wraith13/wraith13.github.io/tree/master/octicons",
                            children: makeOcticonSVG(typed_octicons_1.default["logo-github"]),
                        },
                        filter,
                    ],
                },
                {
                    tag: "ul",
                    children: Object.keys(typed_octicons_1.default)
                        .filter(function (i) { return "default" !== i; }) // evil-commonjs のバグ且つ仕様で default が生えてしまう
                        .map(function (i) {
                        return ({
                            tag: "li",
                            children: renderOction(i),
                            onclick: function () { return copy(i); },
                        });
                    }),
                },
            ]);
            return [2 /*return*/];
        });
    }); };
})(catalog = exports.catalog || (exports.catalog = {}));
//# sourceMappingURL=index.js.map