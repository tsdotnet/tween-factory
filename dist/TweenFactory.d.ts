/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
import { Event } from '@tsdotnet/event-factory/dist/Event';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import PropertyRange, { NumericValues } from './PropertyRange';
import TimeFrame from './TimeFrame';
declare class Events implements tween.Events {
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
declare class TimeFrameEvents extends DisposableBase {
    private readonly _timeFrame;
    protected readonly _triggers: Triggers;
    constructor(_timeFrame: TimeFrame, _triggers: Triggers);
    get timeFrame(): TimeFrame;
    get events(): Events;
    private readonly _state;
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
    protected _onDispose(): void;
}
export declare namespace tween {
    export interface EasingFunction {
        (value: number): number;
    }
    export type Settings = {
        delay?: number;
        duration?: number;
        easing?: EasingFunction;
    };
    abstract class ConfigBase {
        settings: Settings;
        protected _addActive: (factory: (id: number) => Active) => Active;
        protected constructor(settings: Settings, _addActive: (factory: (id: number) => Active) => Active);
        configure(settings: Settings): Behavior;
        /**
         * Configures a tween behavior with the specified delay.
         * @param {number} milliSeconds
         * @return {tween.Behavior}
         */
        delay(milliSeconds: number): Behavior;
        /**
         * Configures a tween behavior with the specified duration.
         * @param {number} milliSeconds
         * @return {tween.Behavior}
         */
        duration(milliSeconds: number): Behavior;
        /**
         * Configures a tween behavior with the specified easing function.
         * @param {EasingFunction} fn
         * @return {tween.Behavior}
         */
        easing(fn: EasingFunction): Behavior;
    }
    /**
     * A class for configuring groups of tweens and signaling their updates.
     */
    export class Factory extends ConfigBase {
        private readonly _activeTweens;
        constructor(defaultEasing: EasingFunction);
        constructor(settings?: Settings);
        /**
         * Triggers updates for all active tweens.
         */
        update(): void;
        /**
         * Cancels (disposes) all active tweens.
         */
        cancelActive(): void;
    }
    export interface Events {
        readonly started: Event<void>;
        readonly updated: Event<number>;
        readonly completed: Event<void>;
        readonly disposed: Event<boolean>;
    }
    export class Behavior extends ConfigBase {
        constructor(settings: Settings, addActive: (factory: (id: number) => Active) => Active);
        /**
         * Adds an object to the behavior.
         * @param target
         * @param endValues
         */
        add<T extends object>(target: T, endValues: Partial<NumericValues<T>>): Config;
    }
    export class Config extends DisposableBase {
        protected readonly _behavior: Behavior;
        protected _addActive: (factory: (id: number) => Active) => Active;
        protected _ranges?: PropertyRange<any>[];
        protected readonly _triggers: Triggers;
        protected _chained?: Config[];
        protected _active?: Active;
        constructor(_behavior: Behavior, _addActive: (factory: (id: number) => Active) => Active);
        /**
         * Events that will be triggered during the tween lifecycle.
         * @return {tween.Events}
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
         * @param {tween.Behavior} behavior
         * @return {tween.Config}
         */
        chain(behavior?: Behavior): Config;
        /**
         * Starts the tween.
         * @param {TimeFrame} timeFrame
         * @return {Active}
         */
        start(timeFrame?: TimeFrame): Active;
        protected _onDispose(): void;
    }
    export class Active extends TimeFrameEvents {
        readonly id: number;
        constructor(id: number, timeFrame: TimeFrame, ranges: PropertyRange[] | Map<EasingFunction, PropertyRange[]>, triggers: Triggers);
    }
    export {};
}
declare const _default: typeof tween.Factory;
export default _default;
