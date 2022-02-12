/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import {DisposableBase} from '@tsdotnet/disposable';
import {Event} from '@tsdotnet/event-factory/dist/Event';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import ArgumentOutOfRangeException from '@tsdotnet/exceptions/dist/ArgumentOutOfRangeException';
import InvalidOperationException from '@tsdotnet/exceptions/dist/InvalidOperationException';
import {OrderedAutoRegistry} from '@tsdotnet/ordered-registry';
import PropertyRange, {NumericValues} from './PropertyRange';
import TimeFrame from './TimeFrame';
import tweening from './Tweening';
import EasingFunction = tweening.EasingFunction;
import OptionalSettings = tweening.OptionalSettings;
import Settings = tweening.Settings;

export { tweening };

const MILLISECONDS_NAN = 'Is not a number value. Should be the number of desired milliseconds.';

type AddActive = (factory: (id: number) => ActiveTween) => ActiveTween;

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

	/**
	 * Triggered by `dispose()` in super class (`DisposableBase`).
	 * @private
	 */
	protected _onDispose (): void
	{
		this._triggers.disposed.publish(this._timeFrame.progress==1);
	}
}

function isTweenable (settings: Partial<Settings>): settings is Settings
{
	const {delay, duration, easing} = settings;
	// noinspection SuspiciousTypeOfGuard
	if(delay!=null && typeof delay!=='number') throw new TypeError('settings.delay is not a number');
	if(easing!=null)
	{
		if(typeof easing!=='function') throw new TypeError('settings.easing is not a function');
		if(typeof easing(0.5)!=='number') throw new TypeError('settings.easing() does not return a number value');
	}
	if(duration==null) return false;
	const sd = 'settings.duration';
	// noinspection SuspiciousTypeOfGuard
	if(typeof duration!=='number') throw new TypeError(sd);
	if(isNaN(duration)) throw new ArgumentException(sd, MILLISECONDS_NAN);
	if(duration<0) throw new ArgumentOutOfRangeException(sd, duration, 'Must be no less than zero.');
	if(!isFinite(duration)) throw new ArgumentOutOfRangeException(sd, duration, 'Must be a finite value.');
	return true;
}

function assertTweenable<TSettings extends Partial<Settings>> (settings: TSettings): TSettings
{
	isTweenable(settings);
	return settings;
}

function copyOptionalSettings (settings: OptionalSettings): OptionalSettings
{
	return {
		delay: settings.delay,
		easing: settings.easing
	};
}

function copySettings (settings: Settings): Settings
{
	return {
		delay: settings.delay,
		duration: settings.duration,
		easing: settings.easing
	};
}

function config (settings: Partial<Settings>, addActive: AddActive): BehaviorBuilder | Behavior
{
	return isTweenable(settings)
		? new Behavior(settings as Settings, addActive)
		: new BehaviorBuilder(settings, addActive);
}

class BehaviorBuilder<TSettings extends OptionalSettings = OptionalSettings>
implements tweening.BehaviorBuilder
{
	constructor (
		public settings: Readonly<TSettings>,
		protected _addActive: AddActive)
	{
		Object.freeze(settings);
	}

	configure (settings: OptionalSettings): tweening.BehaviorBuilder;
	configure (settings: Settings): tweening.Behavior;
	configure (settings: Partial<Settings>): tweening.BehaviorBuilder | Behavior
	{
		return Object.freeze(config({
			delay: settings.delay ?? this.settings.delay,
			duration: settings.duration ?? (this.settings as any).duration,
			easing: settings.easing ?? this.settings.easing
		}, this._addActive));
	}

	/**
	 * Configures a tween behavior with the specified delay.
	 * @param {number} milliSeconds
	 * @return {tween.Behavior}
	 */
	delay (milliSeconds: number): tweening.BehaviorBuilder
	{
		return this.configure({delay: milliSeconds});
	}

	/**
	 * Configures a tween behavior with the specified duration.
	 * @param {number} milliSeconds
	 * @return {tweening.Behavior}
	 */
	duration (milliSeconds: number): tweening.Behavior
	{
		return this.configure({duration: milliSeconds});
	}

	/**
	 * Configures a tween behavior with the specified easing function.
	 * @param {EasingFunction} fn
	 * @return {tweening.Behavior}
	 */
	easing (fn: EasingFunction): tweening.BehaviorBuilder
	{
		return this.configure({easing: fn});
	}
}


class Behavior
	extends BehaviorBuilder<Settings>
	implements tweening.Tweenable
{
	constructor (
		settings: Settings,
		addActive: AddActive)
	{
		super(settings, addActive);
	}

	/**
	 * Adds an object to the behavior.
	 * @throws `InvalidOperationException` if the tween has already been started.
	 * @param {T} target
	 * @param {Partial<NumericValues<T>>} endValues
	 * @param {tweening.EasingFunction | undefined} easing
	 * @return {this}
	 */
	add<T extends object> (
		target: T, endValues: Partial<NumericValues<T>>,
		easing: EasingFunction | undefined = this.settings.easing): Tween
	{
		const starter = new Tween(this.settings, this._addActive);
		starter.add(target, endValues, easing);
		return starter;
	}

	/**
	 * Configures a tween and starts it.
	 * @param {T} target
	 * @param {Partial<NumericValues<T>>} endValues
	 * @param {tweening.EasingFunction | undefined} easing
	 * @return {tweening.ActiveTween}
	 */
	tween<T extends object> (
		target: T, endValues: Partial<NumericValues<T>>,
		easing?: EasingFunction): ActiveTween
	{
		return this.add(target, endValues, easing).start();
	}

	/**
	 * Configures a tween and starts it.
	 * Returns undefined if nothing to tween.
	 * @param {T} target
	 * @param {Partial<NumericValues<T>>} endValues
	 * @param {tweening.EasingFunction} easing
	 * @return {tweening.ActiveTween | undefined}
	 */
	tweenDeltas<T extends object> (
		target: T, endValues: Partial<NumericValues<T>>,
		easing?: EasingFunction): ActiveTween | undefined
	{
		return this.add(target, endValues, easing).start(undefined, true);
	}
}

class Manager
implements tweening.ActiveTweenManager
{
	private _intervalCancel?: () => void;

	constructor (private readonly _activeTweens: OrderedAutoRegistry<ActiveTween>)
	{
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
	cancel (): void
	{
		for(const d of this._activeTweens.values.toArray()) d.dispose();
		this._activeTweens.clear();
	}

	/**
	 * Causes any automatic updates to be cancelled.
	 */
	clearInterval (): this
	{
		const cancel = this._intervalCancel;
		if(cancel) cancel();
		return this;
	}

	/**
	 * Causes active tweens to automatically be updated on each animation frame.
	 * Supported only where `requestAnimationFrame()` is available.
	 */
	updateOnAnimationFrame (): this
	{
		const cancel = this._intervalCancel;
		if(cancel) cancel();
		let cancelled = false;
		this._intervalCancel = () => {
			cancelled = true;
			this._intervalCancel = undefined;
		};
		const update = () => {
			if(cancelled) return;
			requestAnimationFrame(update);
			this.update();
		};
		requestAnimationFrame(update);
		return this;
	}

	/**
	 * Causes active tweens to automatically be updated on an interval.
	 * @param {number} milliseconds
	 */
	updateOnInterval (milliseconds: number): this
	{
		if(!(milliseconds>=0)) throw new ArgumentOutOfRangeException('milliseconds', milliseconds, 'Must be no less than zero.');
		const cancel = this._intervalCancel;
		if(cancel) cancel();
		const interval = setInterval(() => { this.update(); }, milliseconds);
		this._intervalCancel = () => {
			clearInterval(interval);
			this._intervalCancel = undefined;
		};
		return this;
	}

}

/**
 * A class for configuring groups of tweens and signaling their updates.
 */
class Factory<TSettings extends OptionalSettings = OptionalSettings>
	extends BehaviorBuilder<TSettings>
	implements tweening.Manager
{
	readonly active: Manager;
	private readonly _activeTweens = new OrderedAutoRegistry<ActiveTween>();

	constructor (settings: TSettings)
	{
		super(settings, (factory: (id: number) => ActiveTween) => {
			const tweens = this._activeTweens;
			return tweens.addEntry(id => {
				const tween = factory(id);
				tween.events.disposed(() => {
					tweens.remove(id);
				});
				return tween;
			});
		});

		this.active = new Manager(this._activeTweens);
		Object.freeze(this);
	}

	/**
	 * Ensures intervals are cancelled and no tweens are active.
	 */
	dispose ()
	{
		this.active.clearInterval();
		this.active.cancel();
	}


	/**
	 * Causes any automatic updates to be cancelled.
	 */
	clearInterval (): this
	{
		this.active.clearInterval();
		return this;
	}

	/**
	 * Causes active tweens to automatically be updated on each animation frame.
	 * Supported only where `requestAnimationFrame()` is available.
	 */
	updateOnAnimationFrame (): this
	{
		this.active.updateOnAnimationFrame();
		return this;
	}

	/**
	 * Causes active tweens to automatically be updated on an interval.
	 * @param {number} milliseconds
	 */
	updateOnInterval (milliseconds: number): this
	{
		this.active.updateOnInterval(milliseconds);
		return this;
	}
}

class TweenableFactory
	extends Factory<Settings>
	implements tweening.ActiveTweenable
{
	/**
	 * Adds an object to the behavior.
	 * @throws `InvalidOperationException` if the tween has already been started.
	 * @param {T} target
	 * @param {Partial<NumericValues<T>>} endValues
	 * @param {tweening.EasingFunction | undefined} easing
	 * @return {this}
	 */
	add<T extends object> (
		target: T, endValues: Partial<NumericValues<T>>,
		easing: EasingFunction | undefined = this.settings.easing): Tween
	{
		const tween = new Tween(this.settings, this._addActive);
		tween.add(target, endValues, easing);
		return tween;
	}

	/**
	 * Configures a tween and starts it.
	 * @param {T} target
	 * @param {Partial<NumericValues<T>>} endValues
	 * @param {tweening.EasingFunction | undefined} easing
	 * @return {tweening.ActiveTween}
	 */
	tween<T extends object> (
		target: T, endValues: Partial<NumericValues<T>>,
		easing?: EasingFunction): ActiveTween
	{
		return this.add(target, endValues, easing).start();
	}

	/**
	 * Configures a tween and starts it.
	 * Returns undefined if nothing to tween.
	 * @param {T} target
	 * @param {Partial<NumericValues<T>>} endValues
	 * @param {tweening.EasingFunction} easing
	 * @return {tweening.ActiveTween | undefined}
	 */
	tweenDeltas<T extends object> (
		target: T, endValues: Partial<NumericValues<T>>,
		easing?: EasingFunction): ActiveTween | undefined
	{
		return this.add(target, endValues, easing).start(undefined, true);
	}
}

class Tween
	extends DisposableBase
	implements tweening.Tween
{
	protected _ranges?: Map<EasingFunction | undefined, PropertyRange[]> = new Map();
	protected readonly _triggers: Triggers = new Triggers();
	protected _chained?: Tween[] = [];
	protected _active?: ActiveTween;

	constructor (
		protected readonly _settings: Readonly<Settings>,
		protected _addActive: (factory: (id: number) => ActiveTween) => ActiveTween)
	{
		super('Tween');
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
	 * @param {T} target
	 * @param {Partial<NumericValues<T>>} endValues
	 * @param {tweening.EasingFunction | undefined} easing
	 * @return {this}
	 */
	add<T extends object> (
		target: T, endValues: Partial<NumericValues<T>>,
		easing: EasingFunction | undefined = this._settings.easing): this
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
	 * @param {tweening.Settings} settings
	 * @return {tweening.Tween}
	 */
	chain (settings?: Settings): Tween
	{
		this.throwIfDisposed();
		if(settings) isTweenable(settings); // Validate.
		if(!this._chained) throw new InvalidOperationException('Adding more targets to an active tween is not supported.');
		const tween = new Tween(settings && Object.freeze(copySettings(settings)) || this._settings, this._addActive);
		this._chained.push(tween);
		return tween;
	}

	start (timeFrame?: TimeFrame): ActiveTween;
	start (timeFrame?: TimeFrame, deltasOnly?: false): ActiveTween;
	start (timeFrame?: TimeFrame, deltasOnly?: true): ActiveTween | undefined;
	start (timeFrame?: TimeFrame, deltasOnly?: boolean): ActiveTween | undefined;
	/**
	 * Starts the tween.
	 * @param {TimeFrame} timeFrame
	 * @param {boolean} deltasOnly If true, will return undefined if start values match end values.
	 * @return {ActiveTween}
	 */
	start (timeFrame?: TimeFrame, deltasOnly: boolean = false): ActiveTween | undefined
	{
		this.throwIfDisposed();
		if(this._active) throw new InvalidOperationException('Starting a tween more than once is not supported.');

		if(!timeFrame)
		{
			const duration = this._settings.duration;
			const delay = this._settings.delay || 0;
			timeFrame = new TimeFrame(duration, (isNaN(delay) ? 0 : delay) + Date.now());
		}

		const
			_        = this,
			triggers = _._triggers,
			ranges   = _._ranges!,
			chained  = _._chained!;

		const filteredRanges: [EasingFunction | undefined, PropertyRange[]][] = [];
		ranges.forEach((v, k) => {
			const prs: PropertyRange[] = [];
			for(const p of v) if(p.init()) prs.push(p);
			if(prs.length) filteredRanges.push([k, prs]);
			v.length = 0;
		});
		if(deltasOnly && !filteredRanges.length) return undefined;
		_._chained = _._ranges = undefined;
		ranges.clear();
		triggers.started.publish();

		return this._active = this._addActive((id: number) => {
			const tween = new ActiveTween(id, timeFrame!, filteredRanges, triggers);
			triggers.completed.addPost().dispatcher.add(() => {
				for(const next of chained) next.start();
				chained.length = 0;
			});
			return tween;
		});
	}

	/**
	 * Triggered by `dispose()` in super class (`DisposableBase`).
	 * @private
	 */
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

class ActiveTween
	extends TimeFrameEvents
	implements tweening.ActiveTween
{
	constructor (
		public readonly id: number,
		timeFrame: TimeFrame,
		ranges: [EasingFunction | undefined, PropertyRange[]][],
		triggers: Triggers)
	{
		super(timeFrame, triggers);
		this._disposableObjectName = 'ActiveTween';
		Object.freeze(this);

		/*
		 * We use the 'pre update' to actually do the work
		 * so that listeners of the actual event can react to changed values.
		 */
		const updated = triggers.updated.addPre().dispatcher;
		if(ranges.length)
		{
			const [fn, prs] = ranges[0];
			if(ranges.length==1)
			{
				if(fn)
				{
					updated.add(value => {
						const v = fn(value);
						for(const r of prs) r.update(v);
					});
				}
				else
				{
					updated.add(value => {
						for(const r of prs) r.update(value);
					});
				}
			}
			else
			{
				updated.add(value => {
					for(const e of ranges)
					{
						const fn = e[0];
						const v = fn ? fn(value) : value, p = e[1];
						for(const r of p) r.update(v);
					}
				});
			}

		}

		triggers.disposed.dispatcher.add(() => {
			for(const e of ranges)
			{
				const p = e[1];
				for(const r of p) r.dispose();
				p.length = 0;
			}
			ranges.length = 0;
		});
	}
}

/**
 * Creates a `tweening.FactoryBuilder` with the specified easing function as default.
 * @param {tweening.EasingFunction} defaultEasing
 * @return {tweening.FactoryBuilder}
 */
export default function tweenFactory (defaultEasing: EasingFunction)
	: tweening.FactoryBuilder;

/**
 * Creates a `tweening.Factory` with the specified duration and optional easing function.
 * @param {number} defaultDuration
 * @param {tweening.EasingFunction} defaultEasing
 * @return {tweening.Factory}
 */
export default function tweenFactory (defaultDuration: number, defaultEasing?: EasingFunction)
	: tweening.Factory;

/**
 * Creates a `tweening.Factory` using the provided settings.
 * @param {tweening.Settings} defaultSettings
 * @return {tweening.Factory}
 */
export default function tweenFactory (defaultSettings: Settings)
	: tweening.Factory;

/**
 * Creates a `tweening.FactoryBuilder` using the optional settings.
 * @param {tweening.Settings} defaultSettings
 * @return {tweening.Factory}
 */
export default function tweenFactory (defaultSettings?: OptionalSettings)
	: tweening.FactoryBuilder;

/**
 * If a duration is provided, creates a `tweening.Factory`, else creates a `tweening.FactoryBuilder`.
 * @param {tweening.EasingFunction | tweening.OptionalSettings | tweening.Settings | number} defaultSettings
 * @param {tweening.EasingFunction} defaultEasing
 * @return {tweening.FactoryBuilder | tweening.Factory}
 */
export default function tweenFactory (
	defaultSettings?: EasingFunction | OptionalSettings | Settings | number,
	defaultEasing?: EasingFunction)
	: tweening.FactoryBuilder | tweening.Factory {
	switch(typeof defaultSettings)
	{
		case 'number':
			return new TweenableFactory(assertTweenable({
				duration: defaultSettings,
				easing: defaultEasing
			}));
		case 'function':
			return new Factory(assertTweenable({easing: defaultSettings}));
		case 'undefined':
			return new Factory(assertTweenable({easing: defaultEasing}));
		case 'object':
			if(!defaultSettings) break; // null?
			return isTweenable(defaultSettings)
				? new TweenableFactory(copySettings(defaultSettings))
				: new Factory(copyOptionalSettings(defaultSettings));
	}
	throw new Error('Unable to resolve configuration.');
}
