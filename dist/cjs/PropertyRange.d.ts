/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
export type StringKeyOf<T> = string & keyof T;
export type NumericValues<T extends object = object> = Record<StringKeyOf<T>, number>;
export default class PropertyRange<T extends object = object> extends DisposableBase {
    private _item?;
    private _keys?;
    private _activeRanges?;
    private _endValues?;
    constructor(item: T, endValues: Partial<NumericValues<T>>);
    init(startValues?: Partial<NumericValues<T>>): number;
    update(range: number): void;
    protected _onDispose(): void;
}
