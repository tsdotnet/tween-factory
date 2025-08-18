import { DisposableBase } from '@tsdotnet/disposable';
import { EventDispatcher } from '@tsdotnet/event-factory';
import { ArgumentNullException } from '@tsdotnet/exceptions';

/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
const ITEM = 'item', END_VALUES = 'endValues';
const activeRanges = new WeakMap();
class ActivePropertyRange extends DisposableBase {
    property;
    range;
    item;
    disposed;
    constructor(item, property, range) {
        if (!item)
            throw new ArgumentNullException('item');
        const d = new EventDispatcher();
        super('ActivePropertyRange', () => {
            const ar = activeRanges.get(item);
            const a = ar?.get(property);
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
        let ar = activeRanges.get(item);
        if (ar)
            ar.get(property)?.dispose();
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
class PropertyRange extends DisposableBase {
    _item;
    _keys;
    _activeRanges;
    _endValues;
    constructor(item, endValues) {
        super('PropertyRange');
        if (item == null)
            throw new ArgumentNullException(ITEM);
        if (endValues == null)
            throw new ArgumentNullException(END_VALUES);
        const keys = Object.keys(endValues);
        const values = {};
        for (const key of keys) {
            const value = assertNumber(END_VALUES, endValues, key);
            if (isNaN(value))
                continue;
            values[key] = value;
        }
        this._item = item;
        this._endValues = Object.freeze(values);
        this._keys = keys;
    }
    init(startValues) {
        this.throwIfDisposed();
        const item = this._item, endValues = this._endValues, ranges = new Map();
        for (const property of Object.keys(endValues)) {
            const start = startValues && property in startValues
                ? assertNumber('startValues', startValues, property)
                : assertNumber(ITEM, item, property);
            const end = endValues[property];
            if (start === end)
                continue;
            const delta = end - start;
            const apr = new ActivePropertyRange(item, property, Object.freeze({ start, delta, end }));
            apr.disposed.add(() => ranges.delete(property));
            ranges.set(property, apr);
        }
        this._activeRanges = ranges;
        return ranges.size;
    }
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
        }
        this._endValues = undefined;
    }
}
function assertNumber(name, item, property) {
    const value = item[property];
    if (typeof value != 'number')
        throw `'${name}.${property}' must be a number value.`;
    return value;
}

export { PropertyRange as default };
//# sourceMappingURL=PropertyRange.js.map
