/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import {Event} from '@tsdotnet/event-factory/dist/Event';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import {OrderedAutoRegistry} from '@tsdotnet/ordered-registry';
import PropertyRange, {NumericValues} from './PropertyRange';
import TimeFrame from './TimeFrame';

export interface EasingFunction
{
	(value: number): number;
}

export default class TweenFactory
{
	private _activeTweens = new OrderedAutoRegistry<tweening.ActiveTween>();

	constructor (public defaultEasing?: EasingFunction)
	{
	}

	behavior (
		duration: number,
		easing: EasingFunction | undefined = this.defaultEasing): tweening.Behavior
	{
		return new tweening.Behavior(this, duration, easing);
	}

	addActive (factory: (id: number) => tweening.ActiveTween): tweening.ActiveTween
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

	export interface ActiveTween
	{
		readonly events: tweening.Events;

		update (): number;

		complete (): void;

		dispose (): void;
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
			Object.freeze(this);
		}

		/**
		 * Adds an object to the behavior.
		 * @param o
		 * @param endValues
		 */
		add (o: object, endValues: NumericValues): Config
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

		get events (): Events
		{
			return this._triggers.events;
		}

		add<T extends object> (o: T, endValues: NumericValues<T>): this
		{
			this._ranges.push(new PropertyRange<T>(o, endValues));
			return this;
		}

		chain (behavior?: Behavior): Config
		{
			const config = new Config(behavior || this._behavior);
			this._chained.push(config);
			return config;
		}

		start (): ActiveTween
		{
			const
				_        = this,
				behavior = _._behavior,
				triggers = _._triggers;

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
		Object.freeze(this);
	}

	get events (): Events
	{
		return this._triggers.events;
	}

	update (): number
	{
		const _ = this, value = _.getProgress(), e = _._triggers, u = e.updated;
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
		this._triggers.disposed.publish(this.getProgress()==1);
	}
}

class Tween
	extends TimeFrameEvents
	implements tweening.ActiveTween
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
