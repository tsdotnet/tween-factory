/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
export var exponential;
(function (exponential) {
    function easeIn(k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    }
    exponential.easeIn = easeIn;
    function easeOut(k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    }
    exponential.easeOut = easeOut;
    function easeInOut(k) {
        if (k === 0 || k === 1)
            return k;
        if ((k *= 2) < 1)
            return 0.5 * Math.pow(1024, k - 1);
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    }
    exponential.easeInOut = easeInOut;
})(exponential || (exponential = {}));
Object.freeze(exponential);
export default exponential;
//# sourceMappingURL=exponential.js.map