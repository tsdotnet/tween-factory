"use strict";
/*!
 * Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sinusoidal = exports.quintic = exports.quartic = exports.quadratic = exports.exponential = exports.elastic = exports.cubic = exports.circular = exports.bounce = exports.back = exports.noEasing = void 0;
const tslib_1 = require("tslib");
var noEasing_1 = require("./easing/noEasing");
Object.defineProperty(exports, "noEasing", { enumerable: true, get: function () { return tslib_1.__importDefault(noEasing_1).default; } });
var back_1 = require("./easing/back");
Object.defineProperty(exports, "back", { enumerable: true, get: function () { return tslib_1.__importDefault(back_1).default; } });
var bounce_1 = require("./easing/bounce");
Object.defineProperty(exports, "bounce", { enumerable: true, get: function () { return tslib_1.__importDefault(bounce_1).default; } });
var circular_1 = require("./easing/circular");
Object.defineProperty(exports, "circular", { enumerable: true, get: function () { return tslib_1.__importDefault(circular_1).default; } });
var cubic_1 = require("./easing/cubic");
Object.defineProperty(exports, "cubic", { enumerable: true, get: function () { return tslib_1.__importDefault(cubic_1).default; } });
var elastic_1 = require("./easing/elastic");
Object.defineProperty(exports, "elastic", { enumerable: true, get: function () { return tslib_1.__importDefault(elastic_1).default; } });
var exponential_1 = require("./easing/exponential");
Object.defineProperty(exports, "exponential", { enumerable: true, get: function () { return tslib_1.__importDefault(exponential_1).default; } });
var quadratic_1 = require("./easing/quadratic");
Object.defineProperty(exports, "quadratic", { enumerable: true, get: function () { return tslib_1.__importDefault(quadratic_1).default; } });
var quartic_1 = require("./easing/quartic");
Object.defineProperty(exports, "quartic", { enumerable: true, get: function () { return tslib_1.__importDefault(quartic_1).default; } });
var quintic_1 = require("./easing/quintic");
Object.defineProperty(exports, "quintic", { enumerable: true, get: function () { return tslib_1.__importDefault(quintic_1).default; } });
var sinusoidal_1 = require("./easing/sinusoidal");
Object.defineProperty(exports, "sinusoidal", { enumerable: true, get: function () { return tslib_1.__importDefault(sinusoidal_1).default; } });
//# sourceMappingURL=easing.js.map