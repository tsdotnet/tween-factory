"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tween = exports.tweening = void 0;
const tslib_1 = require("tslib");
const EventPublisher_1 = tslib_1.__importDefault(require("@tsdotnet/event-factory/dist/EventPublisher"));
const ArgumentException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentException"));
const ordered_registry_1 = require("@tsdotnet/ordered-registry");
const PropertyRange_1 = tslib_1.__importDefault(require("./PropertyRange"));
const TimeFrame_1 = tslib_1.__importDefault(require("./TimeFrame"));
/**
 * A class for configuring groups of tweens and signaling their updates.
 */
class TweenFactory {
    constructor(defaultEasing) {
        this.defaultEasing = defaultEasing;
        this._activeTweens = new ordered_registry_1.OrderedAutoRegistry();
    }
    /**
     * Initializes a tweening behavior for further configuration.
     * @param {number} duration
     * @param {EasingFunction | undefined} easing
     * @return {tweening.Behavior}
     */
    behavior(duration, easing = this.defaultEasing) {
        return new tweening.Behavior(this, duration, easing);
    }
    /**
     * Adds an active tween using a factory function.
     * @ignore
     * @param {(id: number) => Tween} factory
     * @return {Tween}
     */
    addActive(factory) {
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
    update() {
        for (const tween of this._activeTweens.values.toArray()) {
            tween.update();
        }
    }
}
exports.default = TweenFactory;
var tweening;
(function (tweening) {
    class Behavior {
        /**
         * @param factory The tween factory to manage the tweens with.
         * @param duration Number of milliseconds a tween should be active.
         * @param easing The optional easing function.
         */
        constructor(factory, duration, easing) {
            this.factory = factory;
            this.duration = duration;
            this.easing = easing;
            if (isNaN(duration))
                throw new ArgumentException_1.default('duration', 'Is not a number value. Should be the number of desired milliseconds.');
            Object.freeze(this);
        }
        /**
         * Adds an object to the behavior.
         * @param o
         * @param endValues
         */
        add(o, endValues) {
            const starter = new Config(this);
            starter.add(o, endValues);
            return starter;
        }
    }
    tweening.Behavior = Behavior;
    class Config {
        constructor(_behavior) {
            this._behavior = _behavior;
            this._ranges = [];
            this._triggers = new Triggers();
            this._chained = [];
        }
        /**
         * Events that will be triggered during the tween lifecycle.
         * @return {tweening.Events}
         */
        get events() {
            return this._triggers.events;
        }
        /**
         * Adds an object to the behavior.
         * @param o
         * @param endValues
         */
        add(o, endValues) {
            this._ranges.push(new PropertyRange_1.default(o, endValues));
            return this;
        }
        /**
         * Allows for tweens to occur in sequence.
         * @param {tweening.Behavior} behavior
         * @return {tweening.Config}
         */
        chain(behavior) {
            const config = new Config(behavior || this._behavior);
            this._chained.push(config);
            return config;
        }
        /**
         * Starts the tween.
         * @return {Tween}
         */
        start() {
            const _ = this, behavior = _._behavior, triggers = _._triggers;
            for (const r of _._ranges)
                r.init();
            triggers.started.publish();
            return behavior.factory.addActive((id) => {
                const tween = new Tween(id, behavior, _._ranges, triggers);
                triggers.completed.addPost().dispatcher.add(() => {
                    for (const next of _._chained) {
                        next.start();
                    }
                });
                return tween;
            });
        }
    }
    tweening.Config = Config;
})(tweening = exports.tweening || (exports.tweening = {}));
class Events {
    constructor(started, updated, completed, disposed) {
        this.started = started;
        this.updated = updated;
        this.completed = completed;
        this.disposed = disposed;
        Object.freeze(this);
    }
}
class Triggers {
    constructor() {
        this.started = new EventPublisher_1.default(1);
        this.updated = new EventPublisher_1.default();
        this.completed = new EventPublisher_1.default(1);
        this.disposed = new EventPublisher_1.default(1);
        const _ = this;
        this.events = new Events(_.started.dispatcher.event, _.updated.dispatcher.event, _.completed.dispatcher.event, _.disposed.dispatcher.event);
        Object.freeze(_);
    }
}
class TimeFrameEvents extends TimeFrame_1.default {
    constructor(duration, _triggers) {
        super(duration);
        this._triggers = _triggers;
    }
    get events() {
        return this._triggers.events;
    }
    update() {
        const _ = this, value = _.progress, e = _._triggers, u = e.updated;
        u.publish(value);
        if (value == 1) {
            u.remaining = 0;
            e.completed.publish();
            e.disposed.publish(true);
        }
        return value;
    }
    complete() {
        const _ = this, e = _._triggers, u = e.updated;
        u.publish(1);
        u.remaining = 0;
        e.completed.publish();
        e.disposed.publish(true);
    }
    dispose() {
        this._triggers.disposed.publish(this.progress == 1);
    }
}
class Tween extends TimeFrameEvents {
    constructor(id, behavior, ranges, triggers) {
        super(behavior.duration, triggers);
        this.id = id;
        /*
         * We use the 'pre update' to actually do the work
         * so that listeners of the actual event can react to changed values.
         */
        const updated = triggers.updated.addPre().dispatcher;
        const easing = behavior.easing;
        if (easing)
            updated.add(value => {
                const v = easing(value);
                for (const r of ranges)
                    r.update(v);
            });
        else
            updated.add(value => {
                for (const r of ranges)
                    r.update(value);
            });
    }
}
exports.Tween = Tween;
//# sourceMappingURL=TweenFactory.js.map