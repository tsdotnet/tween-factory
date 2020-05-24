"use strict";
/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */
Object.defineProperty(exports, "__esModule", { value: true });
var quartic;
(function (quartic) {
    function easeIn(k) {
        return k * k * k * k;
    }
    quartic.easeIn = easeIn;
    function easeOut(k) {
        return 1 - (--k * k * k * k);
    }
    quartic.easeOut = easeOut;
    function easeInOut(k) {
        if ((k *= 2) < 1)
            return 0.5 * k * k * k * k;
        return -0.5 * ((k -= 2) * k * k * k - 2);
    }
    quartic.easeInOut = easeInOut;
})(quartic || (quartic = {}));
exports.default = Object.freeze(quartic);
//# sourceMappingURL=quartic.js.map