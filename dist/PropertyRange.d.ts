/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
export declare type StringKeyOf<T> = string & keyof T;
export declare type NumericValues<T extends object = object> = Record<StringKeyOf<T>, number>;
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
     */
    init(startValues?: Partial<NumericValues<T>>): void;
    /**
     * Updates the properties of the item interpolated by the range value.
     * @param {number} range Any decimal value from 0 to 1.
     */
    update(range: number): void;
    protected _onDispose(): void;
}
