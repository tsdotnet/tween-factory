/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
const ITEM = 'item', END_VALUES = 'endValues';
export default class PropertyRange {
    constructor(item, endValues) {
        if (item == null)
            throw new ArgumentNullException(ITEM);
        if (endValues == null)
            throw new ArgumentNullException(END_VALUES);
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
function assertNumber(name, item, property) {
    const value = item[property];
    if (typeof value != 'number' || isNaN(value))
        throw `'${name}.${property}' must be a number value.`;
    return value;
}
//# sourceMappingURL=PropertyRange.js.map