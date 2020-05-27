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

export interface EasingFunction
{
	(value: number): number;
}

/**
 * A class for configuring groups of tweens and signaling their updates.
 */
export default class TweenFactory
{
	private readonly _activeTweens = new OrderedAutoRegistry<Tween>();

	constructor (public defaultEasing?: EasingFunction)
	{
	}

	/**
	 * Initializes a tweening behavior for further configuration.
	 * @param {number} duration
	 * @param {EasingFunction | undefined} easing
	 * @return {tweening.Behavior}
	 */
	behavior (
		duration: number,
		easing: EasingFunction | undefined = this.defaultEasing): tweening.Behavior
	{
		return new tweening.Behavior(this, duration, easing);
	}

	/**
	 * Adds an active tween using a factory function.
	 * @ignore
	 * @param {(id: number) => Tween} factory
	 * @return {Tween}
	 */
	addActive (factory: (id: number) => Tween): Tween
	{
		const tweens = this._activeTweens;
		return tweens.addEntry(id => {
			const tween = factory(id);
			tween.events.disposed(() => {
				tweens.remove(id);
			});
			return tween;
		});
	}

	/**
	 * Triggers updates for all active tweens.
	 */
	update (): void
	{
		for(const tween of this._activeTweens.values.toArray())
		{
			tween.update();
		}
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

export namespace tweening
{
	export interface Events
	{
		readonly started: Event<void>;
		readonly updated: Event<number>;
		readonly completed: Event<void>;
		readonly disposed: Event<boolean>;
	}

	export class Behavior
	{
		/**
		 * @param factory The tween factory to manage the tweens with.
		 * @param duration Number of milliseconds a tween should be active.
		 * @param easing The optional easing function.
		 */
		constructor (
			public factory: TweenFactory,
			public duration: number,
			public easing?: EasingFunction)
		{
			if(isNaN(duration)) throw new ArgumentException('duration', 'Is not a number value. Should be the number of desired milliseconds.');
			Object.freeze(this);
		}

		/**
		 * Adds an object to the behavior.
		 * @param target
		 * @param endValues
		 */
		add<T extends object> (target: T, endValues: Partial<NumericValues<T>>): Config
		{
			const starter = new Config(this);
			starter.add(target, endValues);
			return starter;
		}
	}

	export class Config
		extends DisposableBase
	{
		protected _ranges?: PropertyRange<any>[] = [];
		protected readonly _triggers: Triggers = new Triggers();
		protected _chained?: Config[] = [];
		protected _active?: Tween;

		constructor (
			protected readonly _behavior: Behavior)
		{
			super('tweening.Config');
		}

		/**
		 * Events that will be triggered during the tween lifecycle.
		 * @return {tweening.Events}
		 */
		get events (): Events
		{
			this.throwIfDisposed();
			return this._triggers.events;
		}

		/**
		 * Adds an object to the behavior.
		 * @throws `InvalidOperationException` if the tween has already been started.
		 * @param target
		 * @param endValues
		 */
		add<T extends object> (target: T, endValues: Partial<NumericValues<T>>): this
		{
			this.throwIfDisposed();
			if(this._ranges) this._ranges.push(new PropertyRange<T>(target, endValues));
			else throw new InvalidOperationException('Adding more targets to an active tween is not supported.');
			return this;
		}

		/**
		 * Allows for tweens to occur in sequence.
		 * @throws `InvalidOperationException` if the tween has already been started.
		 * @param {tweening.Behavior} behavior
		 * @return {tweening.Config}
		 */
		chain (behavior?: Behavior): Config
		{
			this.throwIfDisposed();
			if(!this._chained) throw new InvalidOperationException('Adding more targets to an active tween is not supported.');
			const config = new Config(behavior || this._behavior);
			this._chained.push(config);
			return config;
		}

		/**
		 * Starts the tween.
		 * @return {Tween}
		 */
		start (): Tween
		{
			this.throwIfDisposed();
			if(this._active) throw new InvalidOperationException('Starting a tween more than once is not supported.');

			const
				_        = this,
				behavior = _._behavior,
				triggers = _._triggers,
				ranges   = _._ranges!,
				chained  = _._chained!;
			_._chained = _._ranges = undefined;
			for(const r of ranges) r.init();

			triggers.started.publish();
			return this._active = behavior.factory.addActive((id: number) => {
				const tween = new Tween(id, behavior, ranges, triggers);
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
			if(r) for(const d of r) d.dispose();
		}
	}
}


class Events
	implements tweening.Events
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
	extends TimeFrame
{
	constructor (
		duration: number,
		protected readonly _triggers: Triggers)
	{
		super(duration);
	}

	get events (): Events
	{
		return this._triggers.events;
	}

	private _lastUpdate: number = NaN;

	/**
	 * The last time an update() was called (triggered).  NaN if never called.
	 * @return {number}
	 */
	get lastUpdate (): number
	{
		return this._lastUpdate;
	}

	/**
	 * Updates the state and triggers events accordingly.
	 * @return {number}
	 */
	update (): number
	{
		this._lastUpdate = Date.now();
		const value = this.progress, e = this._triggers, u = e.updated;
		u.publish(value);
		if(value==1)
		{
			u.remaining = 0;
			e.completed.publish();
			e.disposed.publish(true);
		}
		return value;
	}

	/**
	 * Forces completion and calls dispose(true).
	 */
	complete (): void
	{
		const e = this._triggers, u = e.updated;
		u.publish(1);
		u.remaining = 0;
		e.completed.publish();
		e.disposed.publish(true);
	}

	/**
	 * Disposes the tween.  All updates are arrested and dispose will signal completion progress.
	 */
	dispose (): void
	{
		this._triggers.disposed.publish(this.progress==1);
	}
}

export class Tween
	extends TimeFrameEvents
{
	constructor (
		public readonly id: number,
		behavior: tweening.Behavior,
		ranges: PropertyRange[],
		triggers: Triggers)
	{
		super(behavior.duration, triggers);

		/*
		 * We use the 'pre update' to actually do the work
		 * so that listeners of the actual event can react to changed values.
		 */
		const updated = triggers.updated.addPre().dispatcher;
		const easing = behavior.easing;
		if(easing) updated.add(value => {
			const v = easing(value);
			for(const r of ranges) r.update(v);
		});
		else updated.add(value => {
			for(const r of ranges) r.update(value);
		});
		triggers.disposed.dispatcher.add(() => {
			for(const r of ranges) r.dispose();
			ranges.length = 0;
		});
	}
}
