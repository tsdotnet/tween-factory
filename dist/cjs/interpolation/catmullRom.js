"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = catmullRom;
function catmullRom(v, k) {
    const m = v.length - 1;
    let f = m * k, i = Math.floor(f);
    const v0 = v[0];
    if (v[0] === v[m]) {
        if (k < 0)
            i = Math.floor(f = m * (1 + k));
        return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
    }
    else {
        if (k < 0) {
            const v1 = v[1];
            return v0 - (fn(v0, v0, v1, v1, -f) - v0);
        }
        if (k > 1) {
            const vm = v[m], vm_1 = v[m - 1];
            return vm - (fn(vm, vm, vm_1, vm_1, f - m) - vm);
        }
        return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
    }
}
function fn(p0, p1, p2, p3, t) {
    const v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, t2 = t * t, t3 = t * t2;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}
//# sourceMappingURL=catmullRom.js.map