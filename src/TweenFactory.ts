/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import {DisposableBase} from '@tsdotnet/disposable';
import {Event} from '@tsdotnet/event-factory/dist/Event';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import InvalidOperationException from '@tsdotnet/exceptions/dist/InvalidOperationException';
import {OrderedAutoRegistry} from '@tsdotnet/ordered-registry';
import PropertyRange, {NumericValues} from './PropertyRange';
import TimeFrame from './TimeFrame';


class Events
	implements tween.Events
{
	constructor (
		public readonly started: Event<void>,
		public readonly updated: Event<number>,
		public readonly completed: Event<void>,
		public readonly disposed: Event<boolean>
	)
	{
		Object.freeze(this);
	}
}

class Triggers
{
	readonly started = new EventPublisher<void>(1);
	readonly updated = new EventPublisher<number>();
	readonly completed = new EventPublisher<void>(1);
	readonly disposed = new EventPublisher<boolean>(1);

	readonly events: Events;

	constructor ()
	{
		const _ = this;
		this.events = new Events(
			_.started.dispatcher.event,
			_.updated.dispatcher.event,
			_.completed.dispatcher.event,
			_.disposed.dispatcher.event);

		Object.freeze(_);
	}

	dispose (): void
	{
		this.started.dispose();
		this.updated.dispose();
		this.completed.dispose();
		this.disposed.dispose();
	}
}

class TimeFrameEvents
	extends DisposableBase
{
	private readonly _state = {lastUpdate: NaN, complete: false};

	constructor (
		private readonly _timeFrame: TimeFrame,
		protected readonly _triggers: Triggers)
	{
		super('TimeFrameEvents');
		_triggers.disposed.dispatcher.add(() => {
			_triggers.updated.remaining = 0;
			Object.freeze(this._state);
		});
	}

	get timeFrame (): TimeFrame { return this._timeFrame; }

	get events (): Events
	{
		return this._triggers.events;
	}

	/**
	 * The last time an update() was called (triggered).  NaN if never called.
	 * @return {number}
	 */
	get lastUpdate (): number
	{
		return this._state.lastUpdate;
	}

	/**
	 * Updates the state and triggers events accordingly.
	 * @return {number}
	 */
	update (): number
	{
		if(this.wasDisposed) return NaN;
		if(this._state.complete) return 1;
		this._state.lastUpdate = Date.now();
		const value = this._timeFrame.progress, e = this._triggers, u = e.updated;
		if(value==1) this.complete();
		else u.publish(value);
		return value;
	}

	/**
	 * Forces completion and calls dispose(true).
	 */
	complete (): void
	{
		if(this.wasDisposed) return;
		const e = this._triggers, u = e.updated;
		u.publish(1);
		u.remaining = 0;
		this._state.complete = true;
		e.completed.publish();
		e.disposed.publish(true);
	}

	protected _onDispose (): void
	{
		this._triggers.disposed.publish(this._timeFrame.progress==1);
	}
}

export namespace tween
{
	export interface EasingFunction
	{
		(value: number): number;
	}

	export type Settings = {
		delay?: number;
		duration?: number
		easing?: EasingFunction;
	}

	abstract class ConfigBase
	{
		protected constructor (
			public settings: Settings = {},
			protected _addActive: (factory: (id: number) => Active) => Active)
		{}

		configure (settings: Settings): Behavior
		{
			return new Behavior({
				delay: settings.delay ?? this.settings.delay,
				duration: settings.duration ?? this.settings.duration,
				easing: settings.easing ?? this.settings.easing
			}, this._addActive);
		}

		/**
		 * Configures a tween behavior with the specified delay.
		 * @param {number} milliSeconds
		 * @return {tween.Behavior}
		 */
		delay (milliSeconds: number): Behavior
		{
			return this.configure({delay: milliSeconds});
		}

		/**
		 * Configures a tween behavior with the specified duration.
		 * @param {number} milliSeconds
		 * @return {tween.Behavior}
		 */
		duration (milliSeconds: number): Behavior
		{
			return this.configure({duration: milliSeconds});
		}

		/**
		 * Configures a tween behavior with the specified easing function.
		 * @param {EasingFunction} fn
		 * @return {tween.Behavior}
		 */
		easing (fn: EasingFunction): Behavior
		{
			return this.configure({easing: fn});
		}

	}

	/**
	 * A class for configuring groups of tweens and signaling their updates.
	 */
	export class Factory
		extends ConfigBase
	{
		private readonly _activeTweens = new OrderedAutoRegistry<Active>();

		constructor (defaultEasing: EasingFunction);
		constructor (settings?: Settings);
		constructor (settings: EasingFunction | Settings = {})
		{
			super(
				typeof settings=='function' ? {easing: settings} : settings,
				(factory: (id: number) => Active) => {
					const tweens = this._activeTweens;
					return tweens.addEntry(id => {
						const tween = factory(id);
						tween.events.disposed(() => {
							tweens.remove(id);
						});
						return tween;
					});
				});
		}


		/**
		 * Triggers updates for all active tweens.
		 */
		update (): void
		{
			for(const tween of this._activeTweens.values.toArray()) tween.update();
		}

		/**
		 * Cancels (disposes) all active tweens.
		 */
		cancelActive (): void
		{
			for(const d of this._activeTweens.values.toArray()) d.dispose();
			this._activeTweens.clear();
		}
	}

	export interface Events
	{
		readonly started: Event<void>;
		readonly updated: Event<number>;
		readonly completed: Event<void>;
		readonly disposed: Event<boolean>;
	}

	export class Behavior
		extends ConfigBase
	{
		constructor (
			settings: Settings,
			addActive: (factory: (id: number) => Active) => Active)
		{
			super(settings, addActive);
			Object.freeze(this);
		}

		/**
		 * Adds an object to the behavior.
		 * @throws `InvalidOperationException` if the tween has already been started.
		 * @param {T} target
		 * @param {Partial<NumericValues<T>>} endValues
		 * @param {tween.EasingFunction | undefined} easing
		 * @return {this}
		 */
		add<T extends object> (
			target: T, endValues: Partial<NumericValues<T>>,
			easing: EasingFunction | undefined = this.settings.easing): Config
		{
			const starter = new Config(this, this._addActive);
			starter.add(target, endValues, easing);
			return starter;
		}
	}

	export class Config
		extends DisposableBase
	{
		protected _ranges?: Map<EasingFunction | undefined, PropertyRange[]> = new Map();
		protected readonly _triggers: Triggers = new Triggers();
		protected _chained?: Config[] = [];
		protected _active?: Active;

		constructor (
			protected readonly _behavior: Behavior,
			protected _addActive: (factory: (id: number) => Active) => Active)
		{
			super('tween.Config');
		}

		/**
		 * Events that will be triggered during the tween lifecycle.
		 * @return {tween.Events}
		 */
		get events (): Events
		{
			this.throwIfDisposed();
			return this._triggers.events;
		}

		/**
		 * Adds an object to the behavior.
		 * @throws `InvalidOperationException` if the tween has already been started.
		 * @param {T} target
		 * @param {Partial<NumericValues<T>>} endValues
		 * @param {tween.EasingFunction | undefined} easing
		 * @return {this}
		 */
		add<T extends object> (
			target: T, endValues: Partial<NumericValues<T>>,
			easing: EasingFunction | undefined = this._behavior.settings.easing): this
		{
			this.throwIfDisposed();
			const ranges = this._ranges;
			if(ranges)
			{
				let pr = ranges.get(easing);
				if(!pr) ranges.set(easing, pr = []);
				pr.push(new PropertyRange<any>(target, endValues));
			}
			else throw new InvalidOperationException('Adding more targets to an active tween is not supported.');
			return this;
		}

		/**
		 * Allows for tweens to occur in sequence.
		 * @throws `InvalidOperationException` if the tween has already been started.
		 * @param {tween.Behavior} behavior
		 * @return {tween.Config}
		 */
		chain (behavior?: Behavior): Config
		{
			this.throwIfDisposed();
			if(!this._chained) throw new InvalidOperationException('Adding more targets to an active tween is not supported.');
			const config = new Config(behavior || this._behavior, this._addActive);
			this._chained.push(config);
			return config;
		}

		/**
		 * Starts the tween.
		 * @param {TimeFrame} timeFrame
		 * @return {Active}
		 */
		start (timeFrame?: TimeFrame): Active
		{
			this.throwIfDisposed();
			if(this._active) throw new InvalidOperationException('Starting a tween more than once is not supported.');

			if(!timeFrame)
			{
				const duration = this._behavior.settings.duration;
				if(typeof duration!='number' || isNaN(duration)) throw new ArgumentException('duration', 'Is not a number value. Should be the number of desired milliseconds.');
				const delay = this._behavior.settings.delay ?? 0;
				timeFrame = new TimeFrame(duration, delay + Date.now());
			}

			const
				_        = this,
				triggers = _._triggers,
				ranges   = _._ranges!,
				chained  = _._chained!;
			_._chained = _._ranges = undefined;

			for(const r of ranges.values()) for(const p of r) p.init();
			triggers.started.publish();

			return this._active = this._addActive((id: number) => {
				const tween = new Active(id, timeFrame!, ranges, triggers);
				triggers.completed.addPost().dispatcher.add(() => {
					for(const next of chained) next.start();
					chained.length = 0;
				});
				return tween;
			});
		}

		protected _onDispose (): void
		{
			this._triggers.disposed.publish(false); // This event can only fire once.
			this._triggers.dispose();
			const c = this._chained, r = this._ranges;
			this._chained = this._ranges = undefined;
			if(c) for(const d of c) d.dispose();
			if(r) for(const d of r.values()) for(const p of d) p.dispose();
		}
	}

	export class Active
		extends TimeFrameEvents
	{
		constructor (
			public readonly id: number,
			timeFrame: TimeFrame,
			ranges: Map<EasingFunction | undefined, PropertyRange[]>,
			triggers: Triggers)
		{
			super(timeFrame, triggers);
			this._disposableObjectName = 'tween.Active';
			Object.freeze(this);

			const easedRanges = [] as [EasingFunction | undefined, PropertyRange[]][];
			ranges.forEach((v, k) => easedRanges.push([k, v]));
			/*
			 * We use the 'pre update' to actually do the work
			 * so that listeners of the actual event can react to changed values.
			 */
			const updated = triggers.updated.addPre().dispatcher;
			updated.add(value => {
				for(const e of easedRanges)
				{
					const f = e[0];
					const v = f ? f(value) : value, p = e[1];
					for(const r of p) r.update(v);
				}
			});
			triggers.disposed.dispatcher.add(() => {
				for(const e of easedRanges)
				{
					const p = e[1];
					for(const r of p) r.dispose();
					p.length = 0;
				}
				easedRanges.length = 0;
			});
		}
	}

}

export default tween.Factory;
