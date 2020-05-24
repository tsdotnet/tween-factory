/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */
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
})(quadratic || (quadratic = {}));
export default Object.freeze(quadratic);
//# sourceMappingURL=quadratic.js.map