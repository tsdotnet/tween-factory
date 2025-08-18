"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catmullRom = exports.bezier = exports.linear = void 0;
const tslib_1 = require("tslib");
var linear_1 = require("./interpolation/linear");
Object.defineProperty(exports, "linear", { enumerable: true, get: function () { return tslib_1.__importDefault(linear_1).default; } });
var bezier_1 = require("./interpolation/bezier");
Object.defineProperty(exports, "bezier", { enumerable: true, get: function () { return tslib_1.__importDefault(bezier_1).default; } });
var catmullRom_1 = require("./interpolation/catmullRom");
Object.defineProperty(exports, "catmullRom", { enumerable: true, get: function () { return tslib_1.__importDefault(catmullRom_1).default; } });
//# sourceMappingURL=interpolation.js.map