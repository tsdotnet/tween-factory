"use strict";
/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cubic = void 0;
var cubic;
(function (cubic) {
    function easeIn(k) {
        return k * k * k;
    }
    cubic.easeIn = easeIn;
    function easeOut(k) {
        return --k * k * k + 1;
    }
    cubic.easeOut = easeOut;
    function easeInOut(k) {
        if ((k *= 2) < 1)
            return 0.5 * k * k * k;
        return 0.5 * ((k -= 2) * k * k + 2);
    }
    cubic.easeInOut = easeInOut;
})(cubic = exports.cubic || (exports.cubic = {}));
Object.freeze(cubic);
exports.default = cubic;
//# sourceMappingURL=cubic.js.map