/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
export declare type StringKeyOf<T> = string & keyof T;
export declare type NumericValues<T extends object = object> = Record<StringKeyOf<T>, number>;
/**
 * A class for modifying a set of properties across a range.
 */
export default class PropertyRange<T extends object = object> {
    private _item;
    private _keys?;
    private _startValues?;
    private _deltaValues?;
    private _endValues;
    constructor(item: T, endValues: Partial<NumericValues<T>>);
    dispose(): void;
    /**
     * Snapshots the start values.
     * Must be called before calling update.
     */
    init(): void;
    /**
     * Updates the properties of the item interpolated by the range value.
     * @param {number} range Any decimal value from 0 to 1.
     */
    update(range: number): void;
}
