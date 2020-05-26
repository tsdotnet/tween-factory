/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import {Event} from '@tsdotnet/event-factory/dist/Event';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
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
	private _activeTweens = new OrderedAutoRegistry<Tween>();

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
		 * @param o
		 * @param endValues
		 */
		add<T extends object> (o: T, endValues: Partial<NumericValues<T>>): Config
		{
			const starter = new Config(this);
			starter.add(o, endValues);
			return starter;
		}
	}

	export class Config
	{
		protected readonly _ranges: PropertyRange<any>[] = [];
		protected readonly _triggers: Triggers = new Triggers();
		protected readonly _chained: Config[] = [];

		constructor (
			protected readonly _behavior: Behavior)
		{
		}

		/**
		 * Events that will be triggered during the tween lifecycle.
		 * @return {tweening.Events}
		 */
		get events (): Events
		{
			return this._triggers.events;
		}

		/**
		 * Adds an object to the behavior.
		 * @param o
		 * @param endValues
		 */
		add<T extends object> (o: T, endValues: Partial<NumericValues<T>>): this
		{
			this._ranges.push(new PropertyRange<T>(o, endValues));
			return this;
		}

		/**
		 * Allows for tweens to occur in sequence.
		 * @param {tweening.Behavior} behavior
		 * @return {tweening.Config}
		 */
		chain (behavior?: Behavior): Config
		{
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
			const
				_        = this,
				behavior = _._behavior,
				triggers = _._triggers;

			for(const r of _._ranges) r.init();
			triggers.started.publish();
			return behavior.factory.addActive((id: number) => {
				const tween = new Tween(id, behavior, _._ranges, triggers);
				triggers.completed.addPost().dispatcher.add(() => {
					for(const next of _._chained)
					{
						next.start();
					}
				});
				return tween;
			});
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

	update (): number
	{
		const _ = this, value = _.progress, e = _._triggers, u = e.updated;
		u.publish(value);
		if(value==1)
		{
			u.remaining = 0;
			e.completed.publish();
			e.disposed.publish(true);
		}
		return value;
	}

	complete (): void
	{
		const _ = this, e = _._triggers, u = e.updated;
		u.publish(1);
		u.remaining = 0;
		e.completed.publish();
		e.disposed.publish(true);
	}

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
	}
}
