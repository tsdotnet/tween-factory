/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
export var quintic;
(function (quintic) {
    function easeIn(k) {
        return k * k * k * k * k;
    }
    quintic.easeIn = easeIn;
    function easeOut(k) {
        return --k * k * k * k * k + 1;
    }
    quintic.easeOut = easeOut;
    function easeInOut(k) {
        if ((k *= 2) < 1)
            return 0.5 * k * k * k * k * k;
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    }
    quintic.easeInOut = easeInOut;
})(quintic || (quintic = {}));
Object.freeze(quintic);
export default quintic;
//# sourceMappingURL=quintic.js.map