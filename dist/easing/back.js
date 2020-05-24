"use strict";
/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */
Object.defineProperty(exports, "__esModule", { value: true });
const s = 1.70158;
const s2 = 1.70158 * 1.525;
var back;
(function (back) {
    function easeIn(k) {
        return k * k * ((s + 1) * k - s);
    }
    back.easeIn = easeIn;
    function easeOut(k) {
        return --k * k * ((s + 1) * k + s) + 1;
    }
    back.easeOut = easeOut;
    function easeInOut(k) {
        if ((k *= 2) < 1)
            return 0.5 * (k * k * ((s2 + 1) * k - s2));
        return 0.5 * ((k -= 2) * k * ((s2 + 1) * k + s2) + 2);
    }
    back.easeInOut = easeInOut;
})(back || (back = {}));
exports.default = Object.freeze(back);
//# sourceMappingURL=back.js.map