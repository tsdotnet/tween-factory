"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const disposable_1 = require("@tsdotnet/disposable");
const event_factory_1 = require("@tsdotnet/event-factory");
const ArgumentNullException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentNullException"));
const ITEM = 'item', END_VALUES = 'endValues';
// Tracks all object properties actively being ranged in order to override or interrupt.
const activeRanges = new WeakMap();
class ActivePropertyRange extends disposable_1.DisposableBase {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    constructor(item, property, range) {
        var _a;
        if (!item)
            throw new ArgumentNullException_1.default('item');
        const d = new event_factory_1.EventDispatcher();
        super('ActivePropertyRange', () => {
            const ar = activeRanges.get(item);
            const a = ar === null || ar === void 0 ? void 0 : ar.get(property);
            if (a === this)
                ar.delete(property);
            this.item = undefined;
            d.dispatch();
            d.dispose();
        });
        this.property = property;
        this.range = range;
        this.disposed = d.event;
        this.item = item;
        // Constructing a new one is an override (interrupt).
        let ar = activeRanges.get(item);
        if (ar)
            (_a = ar.get(property)) === null || _a === void 0 ? void 0 : _a.dispose();
        else
            activeRanges.set(item, ar = new Map());
        ar.set(property, this);
    }
    update(rangeValue) {
        this.throwIfDisposed();
        const range = this.range;
        this.item[this.property] = range.start + range.delta * rangeValue;
    }
}
/**
 * A class for modifying a set of properties across a range.
 */
class PropertyRange extends disposable_1.DisposableBase {
    constructor(item, endValues) {
        super('PropertyRange');
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
        this._endValues = Object.freeze(values);
        this._keys = keys;
    }
    _onDispose() {
        this._item = undefined;
        const ar = this._activeRanges;
        this._activeRanges = undefined;
        if (ar) {
            const ranges = [];
            for (const r of ar.values())
                ranges.push(r);
            for (const r of ranges)
                r.dispose();
            if (ar.size) // should be zero.
             {
                console.warn('Disposal of ActivePropertyRange did not clean as expected.');
                ar.clear();
            }
        }
        this._endValues = undefined;
    }
    /**
     * Snapshots the start values.
     * Must be called before calling update.
     * @param {Partial<NumericValues<T>>} startValues Optional values to initialize with.  Properties not intersecting with end values will be ignored.
     */
    init(startValues) {
        this.throwIfDisposed();
        const item = this._item, endValues = this._endValues, ranges = new Map();
        for (const property of Object.keys(endValues)) {
            const start = startValues && property in startValues
                ? assertNumber('startValues', startValues, property)
                : assertNumber(ITEM, item, property);
            const end = endValues[property];
            const delta = end - start;
            const apr = new ActivePropertyRange(item, property, Object.freeze({ start, delta, end }));
            apr.disposed.add(() => ranges.delete(property));
            ranges.set(property, apr);
        }
        this._activeRanges = ranges;
    }
    /**
     * Updates the properties of the item interpolated by the range value.
     * @param {number} range Any decimal value from 0 to 1.
     */
    update(range) {
        this.throwIfDisposed();
        const ranges = this._activeRanges;
        if (!ranges)
            throw 'PropertyRange was not initialized.  Call .init() before updating.';
        const keys = this._keys;
        if (!keys || !keys.length)
            return;
        let keysShifted = false;
        for (const key of keys) {
            const r = ranges.get(key);
            if (r)
                r.update(range);
            else
                keysShifted = true;
        }
        if (keysShifted) {
            this._keys = keys.filter(k => ranges.has(k));
            if (!this._keys.length)
                this._keys = undefined;
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