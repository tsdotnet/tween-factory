/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

export type StringKeyOf<T> = string & keyof T;
export type NumericValues<T extends object = object> = Record<StringKeyOf<T>, number>;

const ITEM = 'item', END_VALUES = 'endValues';

export default class PropertyRange<T extends object = object>
{
	protected _item: NumericValues<T>;
	protected _keys?: Readonly<StringKeyOf<T>[]>;
	protected _startValues?: Readonly<NumericValues<T>>;
	protected _deltaValues?: Readonly<NumericValues<T>>;
	protected _endValues: Readonly<NumericValues<T>>;

	constructor (item: T, endValues: NumericValues<T>)
	{
		assertNotNull(ITEM, item);
		assertNotNull(END_VALUES, endValues);
		const keys = Object.keys(endValues) as StringKeyOf<T>[];
		const values = {} as NumericValues<T>;

		for(const key of keys) values[key] = assertNumber(END_VALUES, endValues, key);

		this._item = item as NumericValues<T>;
		this._keys = Object.freeze(keys);
		this._endValues = Object.freeze(values);
	}

	dispose (): void
	{
		this._keys = undefined!;
		this._item = undefined!;
		this._startValues = undefined;
		this._deltaValues = undefined;
	}

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

	update (range: number): void
	{
		const keys = this._keys;
		if(!keys) return; // disposed.
		const
			item        = this._item,
			startValues = {} as NumericValues<T>,
			deltaValues = {} as NumericValues<T>;

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

function assertNotNull<T extends object> (name: string, o: T): T | never
{
	if(!o) throw `'${name}' cannot be null or undefined.`;
	return o;
}

function assertNumber (name: string, item: any, property: string | number): number | never
{
	const value = item[property];
	if(typeof value!='number' || isNaN(value)) throw `'${name}.${property}' must be a number value.`;
	return value;
}
