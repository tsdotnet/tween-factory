/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
export declare type StringKeyOf<T> = string & keyof T;
export declare type NumericValues<T extends object = object> = Record<StringKeyOf<T>, number>;
export default class PropertyRange<T extends object = object> {
    protected _item: NumericValues<T>;
    protected _keys?: Readonly<StringKeyOf<T>[]>;
    protected _startValues?: Readonly<NumericValues<T>>;
    protected _deltaValues?: Readonly<NumericValues<T>>;
    protected _endValues: Readonly<NumericValues<T>>;
    constructor(item: T, endValues: NumericValues<T>);
    dispose(): void;
    init(): void;
    update(range: number): void;
}
