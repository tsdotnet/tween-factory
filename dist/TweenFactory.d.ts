/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { Event } from '@tsdotnet/event-factory/dist/Event';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import PropertyRange, { NumericValues } from './PropertyRange';
import TimeFrame from './TimeFrame';
export interface EasingFunction {
    (value: number): number;
}
/**
 * A class for configuring groups of tweens and signaling their updates.
 */
export default class TweenFactory {
    defaultEasing?: EasingFunction | undefined;
    private _activeTweens;
    constructor(defaultEasing?: EasingFunction | undefined);
    /**
     * Initializes a tweening behavior for further configuration.
     * @param {number} duration
     * @param {EasingFunction | undefined} easing
     * @return {tweening.Behavior}
     */
    behavior(duration: number, easing?: EasingFunction | undefined): tweening.Behavior;
    /**
     * Adds an active tween using a factory function.
     * @ignore
     * @param {(id: number) => Tween} factory
     * @return {Tween}
     */
    addActive(factory: (id: number) => Tween): Tween;
    /**
     * Triggers updates for all active tweens.
     */
    update(): void;
}
export declare namespace tweening {
    interface Events {
        readonly started: Event<void>;
        readonly updated: Event<number>;
        readonly completed: Event<void>;
        readonly disposed: Event<boolean>;
    }
    class Behavior {
        factory: TweenFactory;
        duration: number;
        easing?: EasingFunction | undefined;
        /**
         * @param factory The tween factory to manage the tweens with.
         * @param duration Number of milliseconds a tween should be active.
         * @param easing The optional easing function.
         */
        constructor(factory: TweenFactory, duration: number, easing?: EasingFunction | undefined);
        /**
         * Adds an object to the behavior.
         * @param o
         * @param endValues
         */
        add<T extends object>(o: T, endValues: Partial<NumericValues<T>>): Config;
    }
    class Config {
        protected readonly _behavior: Behavior;
        protected readonly _ranges: PropertyRange<any>[];
        protected readonly _triggers: Triggers;
        protected readonly _chained: Config[];
        constructor(_behavior: Behavior);
        /**
         * Events that will be triggered during the tween lifecycle.
         * @return {tweening.Events}
         */
        get events(): Events;
        /**
         * Adds an object to the behavior.
         * @param o
         * @param endValues
         */
        add<T extends object>(o: T, endValues: Partial<NumericValues<T>>): this;
        /**
         * Allows for tweens to occur in sequence.
         * @param {tweening.Behavior} behavior
         * @return {tweening.Config}
         */
        chain(behavior?: Behavior): Config;
        /**
         * Starts the tween.
         * @return {Tween}
         */
        start(): Tween;
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
}
declare class TimeFrameEvents extends TimeFrame {
    protected readonly _triggers: Triggers;
    constructor(duration: number, _triggers: Triggers);
    get events(): Events;
    update(): number;
    complete(): void;
    dispose(): void;
}
export declare class Tween extends TimeFrameEvents {
    readonly id: number;
    constructor(id: number, behavior: tweening.Behavior, ranges: PropertyRange[], triggers: Triggers);
}
export {};
