"use strict";
/**
 * @packageDocumentation
 * @module interpolation
 */
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(v, k) {
    const m = v.length - 1, f = m * k, i = Math.floor(f);
    if (k < 0)
        return fn(v[0], v[1], f);
    if (k > 1)
        return fn(v[m], v[m - 1], m - f);
    return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
}
exports.default = default_1;
function fn(p0, p1, t) {
    return (p1 - p0) * t + p0;
}
//# sourceMappingURL=linear.js.map