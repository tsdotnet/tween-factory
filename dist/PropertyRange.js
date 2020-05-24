"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ITEM = 'item', END_VALUES = 'endValues';
class PropertyRange {
    constructor(item, endValues) {
        assertNotNull(ITEM, item);
        assertNotNull(END_VALUES, endValues);
        const keys = Object.keys(endValues);
        const values = {};
        for (const key of keys)
            values[key] = assertNumber(END_VALUES, endValues, key);
        this._item = item;
        this._keys = Object.freeze(keys);
        this._endValues = Object.freeze(values);
    }
    dispose() {
        this._keys = undefined;
        this._item = undefined;
        this._startValues = undefined;
        this._deltaValues = undefined;
    }
    init() {
        const keys = this._keys;
        if (!keys)
            return; // disposed.
        const item = this._item, startValues = {}, deltaValues = {}, endValues = this._endValues;
        for (const key of keys) {
            const start = assertNumber(ITEM, item, key);
            const end = endValues[key];
            startValues[key] = start;
            deltaValues[key] = end - start;
        }
        this._startValues = Object.freeze(startValues);
        this._deltaValues = Object.freeze(deltaValues);
    }
    update(range) {
        const keys = this._keys;
        if (!keys)
            return; // disposed.
        const item = this._item, startValues = {}, deltaValues = {};
        if (!startValues || !deltaValues)
            throw 'PropertyRange was not initialized.  Call .init() before updating.';
        for (const key of keys) {
            // noinspection UnnecessaryLocalVariableJS
            const value = startValues[key] + deltaValues[key] * range;
            item[key] = value;
        }
    }
}
exports.default = PropertyRange;
function assertNotNull(name, o) {
    if (!o)
        throw `'${name}' cannot be null or undefined.`;
    return o;
}
function assertNumber(name, item, property) {
    const value = item[property];
    if (typeof value != 'number' || isNaN(value))
        throw `'${name}.${property}' must be a number value.`;
    return value;
}
//# sourceMappingURL=PropertyRange.js.map