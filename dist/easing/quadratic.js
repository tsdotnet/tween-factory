"use strict";
/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.quadratic = void 0;
var quadratic;
(function (quadratic) {
    function easeIn(k) {
        return k * k;
    }
    quadratic.easeIn = easeIn;
    function easeOut(k) {
        return k * (2 - k);
    }
    quadratic.easeOut = easeOut;
    function easeInOut(k) {
        if ((k *= 2) < 1)
            return 0.5 * k * k;
        return -0.5 * (--k * (k - 2) - 1);
    }
    quadratic.easeInOut = easeInOut;
})(quadratic = exports.quadratic || (exports.quadratic = {}));
Object.freeze(quadratic);
exports.default = quadratic;
//# sourceMappingURL=quadratic.js.map