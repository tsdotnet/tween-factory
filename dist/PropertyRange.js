"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ArgumentNullException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentNullException"));
const ITEM = 'item', END_VALUES = 'endValues';
/**
 * A class for modifying a set of properties across a range.
 */
class PropertyRange {
    constructor(item, endValues) {
        if (item == null)
            throw new ArgumentNullException_1.default(ITEM);
        if (endValues == null)
            throw new ArgumentNullException_1.default(END_VALUES);
        const keys = Object.keys(endValues);
        const values = {};
        for (const key of keys) {
            const value = assertNumber(END_VALUES, endValues, key);
            if (isNaN(value))
                continue; // NaN = ignore.
            values[key] = value;
        }
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
    /**
     * Snapshots the start values.
     * Must be called before calling update.
     */
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
    /**
     * Updates the properties of the item interpolated by the range value.
     * @param {number} range Any decimal value from 0 to 1.
     */
    update(range) {
        const keys = this._keys;
        if (!keys)
            return; // disposed.
        const item = this._item, startValues = this._startValues, deltaValues = this._deltaValues;
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
function assertNumber(name, item, property) {
    const value = item[property];
    if (typeof value != 'number')
        throw `'${name}.${property}' must be a number value.`;
    return value;
}
//# sourceMappingURL=PropertyRange.js.map