/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
export var circular;
(function (circular) {
    function easeIn(k) {
        return 1 - Math.sqrt(1 - k * k);
    }
    circular.easeIn = easeIn;
    function easeOut(k) {
        return Math.sqrt(1 - (--k * k));
    }
    circular.easeOut = easeOut;
    function easeInOut(k) {
        if ((k *= 2) < 1)
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    }
    circular.easeInOut = easeInOut;
})(circular || (circular = {}));
Object.freeze(circular);
export default circular;
//# sourceMappingURL=circular.js.map