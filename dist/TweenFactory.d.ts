/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
import { Event } from '@tsdotnet/event-factory/dist/Event';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import PropertyRange, { NumericValues } from './PropertyRange';
import TimeFrame from './TimeFrame';
export interface EasingFunction {
    (value: number): number;
}
export declare type TweenSettings = {
    delay?: number;
    duration?: number;
    easing?: EasingFunction;
};
declare abstract class TweenConfigBase {
    settings: TweenSettings;
    protected _addActive: (factory: (id: number) => Tween) => Tween;
    constructor(settings: TweenSettings, _addActive: (factory: (id: number) => Tween) => Tween);
    configure(settings: TweenSettings): tweening.Behavior;
    /**
     * Configures a tween behavior with the specified delay.
     * @param {number} milliSeconds
     * @return {tweening.Behavior}
     */
    delay(milliSeconds: number): tweening.Behavior;
    /**
     * Configures a tween behavior with the specified duration.
     * @param {number} milliSeconds
     * @return {tweening.Behavior}
     */
    duration(milliSeconds: number): tweening.Behavior;
    /**
     * Configures a tween behavior with the specified easing function.
     * @param {EasingFunction} fn
     * @return {tweening.Behavior}
     */
    easing(fn: EasingFunction): tweening.Behavior;
}
/**
 * A class for configuring groups of tweens and signaling their updates.
 */
export default class TweenFactory extends TweenConfigBase {
    private readonly _activeTweens;
    constructor(defaultEasing: EasingFunction);
    constructor(settings?: TweenSettings);
    /**
     * Triggers updates for all active tweens.
     */
    update(): void;
    /**
     * Cancels (disposes) all active tweens.
     */
    cancelActive(): void;
}
export declare namespace tweening {
    interface Events {
        readonly started: Event<void>;
        readonly updated: Event<number>;
        readonly completed: Event<void>;
        readonly disposed: Event<boolean>;
    }
    class Behavior extends TweenConfigBase {
        constructor(settings: TweenSettings, addActive: (factory: (id: number) => Tween) => Tween);
        /**
         * Adds an object to the behavior.
         * @param target
         * @param endValues
         */
        add<T extends object>(target: T, endValues: Partial<NumericValues<T>>): Config;
    }
    class Config extends DisposableBase {
        protected readonly _behavior: Behavior;
        protected _addActive: (factory: (id: number) => Tween) => Tween;
        protected _ranges?: PropertyRange<any>[];
        protected readonly _triggers: Triggers;
        protected _chained?: Config[];
        protected _active?: Tween;
        constructor(_behavior: Behavior, _addActive: (factory: (id: number) => Tween) => Tween);
        /**
         * Events that will be triggered during the tween lifecycle.
         * @return {tweening.Events}
         */
        get events(): Events;
        /**
         * Adds an object to the behavior.
         * @throws `InvalidOperationException` if the tween has already been started.
         * @param target
         * @param endValues
         */
        add<T extends object>(target: T, endValues: Partial<NumericValues<T>>): this;
        /**
         * Allows for tweens to occur in sequence.
         * @throws `InvalidOperationException` if the tween has already been started.
         * @param {tweening.Behavior} behavior
         * @return {tweening.Config}
         */
        chain(behavior?: Behavior): Config;
        /**
         * Starts the tween.
         * @return {Tween}
         */
        /**
         * Starts the tween.
         * @param {TimeFrame} timeFrame
         * @return {Tween}
         */
        start(timeFrame?: TimeFrame): Tween;
        protected _onDispose(): void;
    }
}
declare class Events implements tweening.Events {
    readonly started: Event<void>;
    readonly updated: Event<number>;
    readonly completed: Event<void>;
    readonly disposed: Event<boolean>;
    constructor(started: Event<void>, updated: Event<number>, completed: Event<void>, disposed: Event<boolean>);
}
declare class Triggers {
    readonly started: EventPublisher<void>;
    readonly updated: EventPublisher<number>;
    readonly completed: EventPublisher<void>;
    readonly disposed: EventPublisher<boolean>;
    readonly events: Events;
    constructor();
    dispose(): void;
}
declare class TimeFrameEvents {
    private readonly _timeFrame;
    protected readonly _triggers: Triggers;
    constructor(_timeFrame: TimeFrame, _triggers: Triggers);
    get timeFrame(): TimeFrame;
    get events(): Events;
    private _lastUpdate;
    /**
     * The last time an update() was called (triggered).  NaN if never called.
     * @return {number}
     */
    get lastUpdate(): number;
    /**
     * Updates the state and triggers events accordingly.
     * @return {number}
     */
    update(): number;
    /**
     * Forces completion and calls dispose(true).
     */
    complete(): void;
    /**
     * Disposes the tween.  All updates are arrested and dispose will signal completion progress.
     */
    dispose(): void;
}
export declare class Tween extends TimeFrameEvents {
    readonly id: number;
    constructor(id: number, timeFrame: TimeFrame, behavior: tweening.Behavior, ranges: PropertyRange[], triggers: Triggers);
}
export {};
