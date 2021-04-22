"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bezier(v, k) {
    const n = v.length - 1, pw = Math.pow;
    let b = 0;
    for (let i = 0; i <= n; i++) {
        b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
    }
    return b;
}
exports.default = bezier;
function bn(n, i) {
    return fc(n) / fc(i) / fc(n - i);
}
// factorial cache
const a = [1];
function fc(n) {
    let s = 1, i;
    if (a[n])
        return a[n];
    for (i = n; i > 1; i--)
        s *= i;
    return a[n] = s;
}
//# sourceMappingURL=bezier.js.map