/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
export type StringKeyOf<T> = string & keyof T;
export type NumericValues<T extends object = object> = Record<StringKeyOf<T>, number>;
/**
 * A class for modifying a set of properties across a range.
 */
export default class PropertyRange<T extends object = object> extends DisposableBase {
    private _item?;
    private _keys?;
    private _activeRanges?;
    private _endValues?;
    constructor(item: T, endValues: Partial<NumericValues<T>>);
    /**
     * Snapshots the start values.
     * Must be called before calling update.
     * @param {Partial<NumericValues<T>>} startValues Optional values to initialize with.  Properties not intersecting with end values will be ignored.
     * @param {Partial<NumericValues<T>>} startValues
     * @return {number} Number of properties that are ranged.
     */
    init(startValues?: Partial<NumericValues<T>>): number;
    /**
     * Updates the properties of the item interpolated by the range value.
     * @param {number} range Any decimal value from 0 to 1.
     */
    update(range: number): void;
    /**
     * Triggered by `dispose()` in super class (`DisposableBase`).
     * @private
     */
    protected _onDispose(): void;
}
