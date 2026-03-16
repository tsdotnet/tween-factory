"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catmullRom = exports.bezier = exports.linear = void 0;
const tslib_1 = require("tslib");
var linear_js_1 = require("./interpolation/linear.js");
Object.defineProperty(exports, "linear", { enumerable: true, get: function () { return tslib_1.__importDefault(linear_js_1).default; } });
var bezier_js_1 = require("./interpolation/bezier.js");
Object.defineProperty(exports, "bezier", { enumerable: true, get: function () { return tslib_1.__importDefault(bezier_js_1).default; } });
var catmullRom_js_1 = require("./interpolation/catmullRom.js");
Object.defineProperty(exports, "catmullRom", { enumerable: true, get: function () { return tslib_1.__importDefault(catmullRom_js_1).default; } });
//# sourceMappingURL=interpolation.js.map