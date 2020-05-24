/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';
import PropertyRange from './PropertyRange';
import TimeFrame from './TimeFrame';
export default class TweenFactory {
    constructor(defaultEasing) {
        this.defaultEasing = defaultEasing;
        this._activeTweens = new OrderedAutoRegistry();
    }
    behavior(duration, easing = this.defaultEasing) {
        return new tweening.Behavior(this, duration, easing);
    }
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
    update() {
        for (const tween of this._activeTweens.values.toArray()) {
            tween.update();
        }
    }
}
export var tweening;
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
        get events() {
            return this._triggers.events;
        }
        add(o, endValues) {
            this._ranges.push(new PropertyRange(o, endValues));
            return this;
        }
        chain(behavior) {
            const config = new Config(behavior || this._behavior);
            this._chained.push(config);
            return config;
        }
        start() {
            const _ = this, behavior = _._behavior, triggers = _._triggers;
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
})(tweening || (tweening = {}));
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
        this.started = new EventPublisher(1);
        this.updated = new EventPublisher();
        this.completed = new EventPublisher(1);
        this.disposed = new EventPublisher(1);
        const _ = this;
        this.events = new Events(_.started.dispatcher.event, _.updated.dispatcher.event, _.completed.dispatcher.event, _.disposed.dispatcher.event);
        Object.freeze(_);
    }
}
class TimeFrameEvents extends TimeFrame {
    constructor(duration, _triggers) {
        super(duration);
        this._triggers = _triggers;
        Object.freeze(this);
    }
    get events() {
        return this._triggers.events;
    }
    update() {
        const _ = this, value = _.getProgress(), e = _._triggers, u = e.updated;
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
        this._triggers.disposed.publish(this.getProgress() == 1);
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
//# sourceMappingURL=TweenFactory.js.map