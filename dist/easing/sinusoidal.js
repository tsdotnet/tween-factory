"use strict";
/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sinusoidal = void 0;
var sinusoidal;
(function (sinusoidal) {
    function easeIn(k) {
        return 1 - Math.cos(k * Math.PI / 2);
    }
    sinusoidal.easeIn = easeIn;
    function easeOut(k) {
        return Math.sin(k * Math.PI / 2);
    }
    sinusoidal.easeOut = easeOut;
    function easeInOut(k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    }
    sinusoidal.easeInOut = easeInOut;
})(sinusoidal = exports.sinusoidal || (exports.sinusoidal = {}));
Object.freeze(sinusoidal);
exports.default = sinusoidal;
//# sourceMappingURL=sinusoidal.js.map