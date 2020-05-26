"use strict";
/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bounce = void 0;
var bounce;
(function (bounce) {
    function easeIn(k) {
        return 1 - easeOut(1 - k);
    }
    bounce.easeIn = easeIn;
    function easeOut(k) {
        if (k < (1 / 2.75)) {
            return 7.5625 * k * k;
        }
        else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        }
        else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        }
        else {
            return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
        }
    }
    bounce.easeOut = easeOut;
    function easeInOut(k) {
        if (k < 0.5)
            return easeIn(k * 2) * 0.5;
        return easeOut(k * 2 - 1) * 0.5 + 0.5;
    }
    bounce.easeInOut = easeInOut;
})(bounce = exports.bounce || (exports.bounce = {}));
Object.freeze(bounce);
exports.default = bounce;
//# sourceMappingURL=bounce.js.map