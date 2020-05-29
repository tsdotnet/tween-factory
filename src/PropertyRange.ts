/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import {DisposableBase} from '@tsdotnet/disposable';
import {EventDispatcher} from '@tsdotnet/event-factory';
import {Event} from '@tsdotnet/event-factory/dist/Event';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import {Range} from './Range';

export type StringKeyOf<T> = string & keyof T;
export type NumericValues<T extends object = object> = Record<StringKeyOf<T>, number>;

const ITEM = 'item', END_VALUES = 'endValues';

type ActivePropertyRangeMap<T extends object = any>
	= Map<StringKeyOf<T>, ActivePropertyRange<T, StringKeyOf<T>>>;

// Tracks all object properties actively being ranged in order to override or interrupt.
const activeRanges = new WeakMap<object, ActivePropertyRangeMap>();

class ActivePropertyRange<T extends object, K extends StringKeyOf<T> = StringKeyOf<T>>
	extends DisposableBase
{
	readonly item: Record<K, number>;
	readonly disposed: Event<void>;

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	constructor (
		item: T,
		public readonly property: K,
		public readonly range: Readonly<Range>)
	{
		if(!item) throw new ArgumentNullException('item');
		const d = new EventDispatcher<void>();
		super('ActivePropertyRange', () => {
			const ar = activeRanges.get(item);
			const a = ar?.get(property);
			if(a===this) ar!.delete(property);
			(this as any).item = undefined;
			d.dispatch();
			d.dispose();
		});
		this.disposed = d.event;
		this.item = item as Record<K, number>;

		// Constructing a new one is an override (interrupt).
		let ar = activeRanges.get(item);
		if(ar) ar.get(property)?.dispose();
		else activeRanges.set(item, ar = new Map<string, ActivePropertyRange<any, string>>());
		ar.set(property, this);
	}

	update (rangeValue: number): void
	{
		this.throwIfDisposed();
		const range = this.range;
		this.item[this.property] = range.start + range.delta*rangeValue;
	}
}

/**
 * A class for modifying a set of properties across a range.
 */
export default class PropertyRange<T extends object = object>
	extends DisposableBase
{
	private _item?: NumericValues<T>;
	private _keys?: StringKeyOf<T>[];
	private _activeRanges?: ActivePropertyRangeMap<T>;
	private _endValues?: Readonly<NumericValues<T>>;

	constructor (item: T, endValues: Partial<NumericValues<T>>)
	{
		super('PropertyRange');
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
		this._endValues = Object.freeze(values);
		this._keys = keys;
	}

	/**
	 * Snapshots the start values.
	 * Must be called before calling update.
	 * @param {Partial<NumericValues<T>>} startValues Optional values to initialize with.  Properties not intersecting with end values will be ignored.
	 * @param {Partial<NumericValues<T>>} startValues
	 * @return {number} Number of properties that are ranged.
	 */
	init (startValues?: Partial<NumericValues<T>>): number
	{
		this.throwIfDisposed();
		const
			item      = this._item!,
			endValues = this._endValues!,
			ranges    = new Map() as ActivePropertyRangeMap<T>;

		for(const property of Object.keys(endValues) as StringKeyOf<T>[])
		{
			const start = startValues && property in startValues
				? assertNumber('startValues', startValues, property)
				: assertNumber(ITEM, item, property);
			const end = endValues[property];
			if(start===end) continue;
			const delta = end - start;
			const apr = new ActivePropertyRange(item, property, Object.freeze({start, delta, end}));
			apr.disposed.add(() => ranges.delete(property));
			ranges.set(property, apr);
		}

		this._activeRanges = ranges;
		return ranges.size;
	}

	/**
	 * Updates the properties of the item interpolated by the range value.
	 * @param {number} range Any decimal value from 0 to 1.
	 */
	update (range: number): void
	{
		this.throwIfDisposed();
		const ranges = this._activeRanges;
		if(!ranges) throw 'PropertyRange was not initialized.  Call .init() before updating.';

		const keys = this._keys;
		if(!keys || !keys.length) return;

		let keysShifted = false;
		for(const key of keys)
		{
			const r = ranges.get(key);
			if(r) r.update(range);
			else keysShifted = true;
		}

		if(keysShifted)
		{
			this._keys = keys.filter(k => ranges.has(k));
			if(!this._keys.length) this._keys = undefined;
		}
	}

	/**
	 * Triggered by `dispose()` in super class (`DisposableBase`).
	 * @private
	 */
	protected _onDispose (): void
	{
		this._item = undefined;
		const ar = this._activeRanges;
		this._activeRanges = undefined;
		if(ar)
		{
			const ranges = [] as ActivePropertyRange<T>[];
			for(const r of ar.values()) ranges.push(r);
			for(const r of ranges) r.dispose();
		}
		this._endValues = undefined;
	}
}

function assertNumber (name: string, item: any, property: string | number): number | never
{
	const value = item[property];
	if(typeof value!='number') throw `'${name}.${property}' must be a number value.`;
	return value;
}
