/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { Event } from '@tsdotnet/event-factory/dist/Event';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import PropertyRange, { NumericValues } from './PropertyRange';
export interface EasingFunction {
    (value: number): number;
}
export default class TweenFactory {
    defaultEasing?: EasingFunction | undefined;
    private _activeTweens;
    constructor(defaultEasing?: EasingFunction | undefined);
    behavior(duration: number, easing?: EasingFunction | undefined): tweening.Behavior;
    addActive(factory: (id: number) => tweening.ActiveTween): tweening.ActiveTween;
    update(): void;
}
export declare namespace tweening {
    interface Events {
        readonly started: Event<void>;
        readonly updated: Event<number>;
        readonly completed: Event<void>;
        readonly disposed: Event<boolean>;
    }
    interface ActiveTween {
        readonly events: tweening.Events;
        update(): number;
        complete(): void;
        dispose(): void;
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
        add(o: object, endValues: NumericValues): Config;
    }
    class Config {
        protected readonly _behavior: Behavior;
        protected readonly _ranges: PropertyRange<any>[];
        protected readonly _triggers: Triggers;
        protected readonly _chained: Config[];
        constructor(_behavior: Behavior);
        get events(): Events;
        add<T extends object>(o: T, endValues: NumericValues<T>): this;
        chain(behavior?: Behavior): Config;
        start(): ActiveTween;
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
export {};
