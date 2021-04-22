"use strict";
/* Included for forward compatibility. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.catmullRom = exports.bezier = exports.linear = void 0;
const tslib_1 = require("tslib");
const bezier_1 = tslib_1.__importDefault(require("./interpolation/bezier"));
exports.bezier = bezier_1.default;
const catmullRom_1 = tslib_1.__importDefault(require("./interpolation/catmullRom"));
exports.catmullRom = catmullRom_1.default;
const linear_1 = tslib_1.__importDefault(require("./interpolation/linear"));
exports.linear = linear_1.default;
//# sourceMappingURL=interpolation.js.map