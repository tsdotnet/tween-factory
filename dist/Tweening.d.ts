/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */


import Disposable from '@tsdotnet/disposable/dist/Disposable';
import {Event} from '@tsdotnet/event-factory/dist/Event';
import {NumericValues} from './PropertyRange';
import TimeFrame from './TimeFrame';

export namespace tweening
{
	/**
	 * Tween life-cycle events.
	 */
	export interface Events
	{
		readonly started: Event<void>;
		readonly updated: Event<number>;
		readonly completed: Event<void>;
		readonly disposed: Event<boolean>;
	}

	/**
	 * Any function that accepts a number and returns a number.
	 * Expects an input from 0 to 1, and return a number from 0 to 1.
	 */
	export interface EasingFunction
	{
		(value: number): number
	}

	/**
	 * Optional tween settings.
	 */
	export type OptionalSettings = {
		delay?: number
		easing?: EasingFunction
	}

	/**
	 * Minimum settings to start a tween.
	 */
	export type Settings = OptionalSettings & {
		duration: number;
	}

	/**
	 * A factory entity that can create behaviors from a duration value.
	 */
	export interface BuilderWithDuration
	{
		/**
		 * Configures a tween behavior with the specified duration.
		 * @param {number} milliSeconds
		 * @return {tweening.Behavior}
		 */
		duration (milliSeconds: number): Behavior
	}

	/**
	 * A factory entity that can configure a tween.
	 */
	export interface Tweenable
	{
		/**
		 * Adds an object to the behavior.
		 * @throws `InvalidOperationException` if the tween has already been started.
		 * @param {T} target
		 * @param {Partial<NumericValues<T>>} endValues
		 * @param {tweening.EasingFunction | undefined} easing
		 * @return {tweening.Tween}
		 */
		add<T extends object> (
			target: T, endValues: Partial<NumericValues<T>>,
			easing?: EasingFunction): Tween
	}

	/**
	 * A factory entity that can configure and start a tween.
	 */
	export interface ActiveTweenable
		extends Tweenable
	{
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
	}

	/**
	 * A factory entity that can create more behaviors.
	 */
	export interface BehaviorBuilder
		extends BuilderWithDuration
	{
		/**
		 * Configures a tween behavior.
		 * @param {tweening.OptionalSettings} settings
		 * @return {tweening.BehaviorBuilder}
		 */
		configure (settings: OptionalSettings): BehaviorBuilder

		/**
		 * Configures a tween behavior that is ready for tweening.
		 * @param {tweening.OptionalSettings} settings
		 * @return {tweening.Behavior}
		 */
		configure (settings: Settings): Behavior

		/**
		 * Configures a tween behavior with the specified delay.
		 * @param {number} milliSeconds
		 * @return {tweening.BehaviorBuilder}
		 */
		delay (milliSeconds: number): BehaviorBuilder

		/**
		 * Configures a tween behavior with the specified easing function.
		 * @param {tweening.EasingFunction} fn
		 * @return {tweening.BehaviorBuilder}
		 */
		easing (fn: EasingFunction): BehaviorBuilder
	}

	/**
	 * A factory entity that can create more behaviors or tweens.
	 */
	export interface Behavior
		extends BuilderWithDuration, ActiveTweenable
	{
		configure (settings: Partial<Settings>): Behavior

		/**
		 * Configures a tween behavior with the specified delay.
		 * @param {number} milliSeconds
		 * @return {tweening.Behavior}
		 */
		delay (milliSeconds: number): Behavior;

		/**
		 * Configures a tween behavior with the specified duration.
		 * @param {number} milliSeconds
		 * @return {tweening.Behavior}
		 */
		duration (milliSeconds: number): Behavior


		/**
		 * Configures a tween behavior with the specified easing function.
		 * @param {tweening.EasingFunction} fn
		 * @return {tweening.Behavior}
		 */
		easing (fn: EasingFunction): Behavior
	}

	/**
	 * An entity that broadcasts tween life-cycle events.
	 */
	export interface EventBroadcaster
	{
		/**
		 * For listening to life-cycle events.
		 */
		readonly events: Events
	}

	/**
	 * A tween that is being configured.
	 */
	export interface Tween
		extends Tweenable, EventBroadcaster, Disposable
	{
		/**
		 * Starts the tween.
		 * @param {TimeFrame} timeFrame
		 * @return {tweening.ActiveTween}
		 */
		start (timeFrame?: TimeFrame): ActiveTween

		/**
		 * Allows for tweens to occur in sequence.
		 * @throws `InvalidOperationException` if the tween has already been started.
		 * @param {tweening.Behavior} behavior
		 * @return {tweening.Tween}
		 */
		chain (behavior?: Settings): Tween
	}

	/**
	 * A tween that has been activated.
	 */
	export interface ActiveTween
		extends EventBroadcaster, Disposable
	{
		/**
		 * The time frame of the active tween.
		 */
		readonly timeFrame: TimeFrame;

		/**
		 * The last time an update() was called (triggered).  NaN if never called.
		 * @return {number}
		 */
		readonly lastUpdate: number

		/**
		 * Updates the state and triggers events accordingly.
		 * @return {number}
		 */
		update (): number

		/**
		 * Forces completion and calls dispose(true).
		 */
		complete (): void
	}

	/**
	 * Controller for automatically triggering updates.
	 */
	export interface ActiveTweenUpdater
	{
		/**
		 * Causes active tweens to automatically be updated on each animation frame.
		 * Supported only where `requestAnimationFrame()` is available.
		 */
		updateOnAnimationFrame (): this;

		/**
		 * Causes active tweens to automatically be updated on an interval.
		 * @param {number} milliseconds
		 */
		updateOnInterval (milliseconds: number): this;

		/**
		 * Causes any automatic updates to be cancelled.
		 */
		clearInterval (): this;
	}

	/**
	 * Controller for active tweens.
	 */
	export interface ActiveTweenManager
		extends ActiveTweenUpdater
	{
		/**
		 * Triggers updates for all active tweens.
		 */
		update (): void

		/**
		 * Cancels (disposes) all active tweens.
		 */
		cancel (): void
	}

	/**
	 * Can control active tweens.
	 */
	export interface Manager
		extends ActiveTweenUpdater, Disposable
	{
		readonly active: ActiveTweenManager;
	}

	/**
	 * Can configure and update tweens.
	 */
	export type FactoryBuilder = Manager & BehaviorBuilder;

	/**
	 * Can configure, add, start, and update tweens.
	 */
	export type Factory = Manager & Behavior;

}

export default tweening;
