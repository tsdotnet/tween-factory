/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';

export type StringKeyOf<T> = string & keyof T;
export type NumericValues<T extends object = object> = Record<StringKeyOf<T>, number>;

const ITEM = 'item', END_VALUES = 'endValues';

/**
 * A class for modifying a set of properties across a range.
 */
export default class PropertyRange<T extends object = object>
{
	private _item: NumericValues<T>;
	private _keys?: Readonly<StringKeyOf<T>[]>;
	private _startValues?: Readonly<NumericValues<T>>;
	private _deltaValues?: Readonly<NumericValues<T>>;
	private _endValues: Readonly<NumericValues<T>>;

	constructor (item: T, endValues: Partial<NumericValues<T>>)
	{
		if(item==null) throw new ArgumentNullException(ITEM);
		if(endValues==null) throw new ArgumentNullException(END_VALUES);
		const keys = Object.keys(endValues) as StringKeyOf<T>[];
		const values = {} as NumericValues<T>;

		for(const key of keys)
		{
			const value = assertNumber(END_VALUES, endValues, key);
			if(isNaN(value)) continue; // NaN = ignore.
			values[key] = value;
		}

		this._item = item as NumericValues<T>;
		this._keys = Object.freeze(keys);
		this._endValues = Object.freeze(values);
	}

	dispose (): void
	{
		this._keys = undefined;
		this._item = undefined!;
		this._startValues = undefined;
		this._deltaValues = undefined;
	}

	/**
	 * Snapshots the start values.
	 * Must be called before calling update.
	 */
	init (): void
	{
		const keys = this._keys;
		if(!keys) return; // disposed.
		const
			item        = this._item,
			startValues = {} as NumericValues<T>,
			deltaValues = {} as NumericValues<T>,
			endValues   = this._endValues;

		for(const key of keys)
		{
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
	update (range: number): void
	{
		const keys = this._keys;
		if(!keys) return; // disposed.
		const
			item        = this._item,
			startValues = this._startValues,
			deltaValues = this._deltaValues;

		if(!startValues || !deltaValues)
			throw 'PropertyRange was not initialized.  Call .init() before updating.';

		for(const key of keys)
		{
			// noinspection UnnecessaryLocalVariableJS
			const value = startValues[key] + deltaValues[key]*range;
			item[key] = value;
		}
	}
}

function assertNumber (name: string, item: any, property: string | number): number | never
{
	const value = item[property];
	if(typeof value!='number') throw `'${name}.${property}' must be a number value.`;
	return value;
}
