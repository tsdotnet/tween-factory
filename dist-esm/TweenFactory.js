/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
import EventPublisher from '@tsdotnet/event-factory/dist/EventPublisher';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import InvalidOperationException from '@tsdotnet/exceptions/dist/InvalidOperationException';
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';
import PropertyRange from './PropertyRange';
import TimeFrame from './TimeFrame';
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
    dispose() {
        this.started.dispose();
        this.updated.dispose();
        this.completed.dispose();
        this.disposed.dispose();
    }
}
class TimeFrameEvents extends DisposableBase {
    constructor(_timeFrame, _triggers) {
        super('TimeFrameEvents');
        this._timeFrame = _timeFrame;
        this._triggers = _triggers;
        this._state = { lastUpdate: NaN, complete: false };
        _triggers.disposed.dispatcher.add(() => {
            _triggers.updated.remaining = 0;
            Object.freeze(this._state);
        });
    }
    get timeFrame() { return this._timeFrame; }
    get events() {
        return this._triggers.events;
    }
    /**
     * The last time an update() was called (triggered).  NaN if never called.
     * @return {number}
     */
    get lastUpdate() {
        return this._state.lastUpdate;
    }
    /**
     * Updates the state and triggers events accordingly.
     * @return {number}
     */
    update() {
        if (this.wasDisposed)
            return NaN;
        if (this._state.complete)
            return 1;
        this._state.lastUpdate = Date.now();
        const value = this._timeFrame.progress, e = this._triggers, u = e.updated;
        if (value == 1)
            this.complete();
        else
            u.publish(value);
        return value;
    }
    /**
     * Forces completion and calls dispose(true).
     */
    complete() {
        if (this.wasDisposed)
            return;
        const e = this._triggers, u = e.updated;
        u.publish(1);
        u.remaining = 0;
        this._state.complete = true;
        e.completed.publish();
        e.disposed.publish(true);
    }
    _onDispose() {
        this._triggers.disposed.publish(this._timeFrame.progress == 1);
    }
}
export var tween;
(function (tween_1) {
    class ConfigBase {
        constructor(settings = {}, _addActive) {
            this.settings = settings;
            this._addActive = _addActive;
        }
        configure(settings) {
            var _a, _b, _c;
            return new Behavior({
                delay: (_a = settings.delay) !== null && _a !== void 0 ? _a : this.settings.delay,
                duration: (_b = settings.duration) !== null && _b !== void 0 ? _b : this.settings.duration,
                easing: (_c = settings.easing) !== null && _c !== void 0 ? _c : this.settings.easing
            }, this._addActive);
        }
        /**
         * Configures a tween behavior with the specified delay.
         * @param {number} milliSeconds
         * @return {tween.Behavior}
         */
        delay(milliSeconds) {
            return this.configure({ delay: milliSeconds });
        }
        /**
         * Configures a tween behavior with the specified duration.
         * @param {number} milliSeconds
         * @return {tween.Behavior}
         */
        duration(milliSeconds) {
            return this.configure({ duration: milliSeconds });
        }
        /**
         * Configures a tween behavior with the specified easing function.
         * @param {EasingFunction} fn
         * @return {tween.Behavior}
         */
        easing(fn) {
            return this.configure({ easing: fn });
        }
    }
    /**
     * A class for configuring groups of tweens and signaling their updates.
     */
    class Factory extends ConfigBase {
        constructor(settings = {}) {
            super(typeof settings == 'function' ? { easing: settings } : settings, (factory) => {
                const tweens = this._activeTweens;
                return tweens.addEntry(id => {
                    const tween = factory(id);
                    tween.events.disposed(() => {
                        tweens.remove(id);
                    });
                    return tween;
                });
            });
            this._activeTweens = new OrderedAutoRegistry();
        }
        /**
         * Triggers updates for all active tweens.
         */
        update() {
            for (const tween of this._activeTweens.values.toArray())
                tween.update();
        }
        /**
         * Cancels (disposes) all active tweens.
         */
        cancelActive() {
            for (const d of this._activeTweens.values.toArray())
                d.dispose();
            this._activeTweens.clear();
        }
    }
    tween_1.Factory = Factory;
    class Behavior extends ConfigBase {
        constructor(settings, addActive) {
            super(settings, addActive);
            Object.freeze(this);
        }
        /**
         * Adds an object to the behavior.
         * @throws `InvalidOperationException` if the tween has already been started.
         * @param {T} target
         * @param {Partial<NumericValues<T>>} endValues
         * @param {tween.EasingFunction | undefined} easing
         * @return {this}
         */
        add(target, endValues, easing = this.settings.easing) {
            const starter = new Config(this, this._addActive);
            starter.add(target, endValues, easing);
            return starter;
        }
    }
    tween_1.Behavior = Behavior;
    class Config extends DisposableBase {
        constructor(_behavior, _addActive) {
            super('tween.Config');
            this._behavior = _behavior;
            this._addActive = _addActive;
            this._ranges = new Map();
            this._triggers = new Triggers();
            this._chained = [];
        }
        /**
         * Events that will be triggered during the tween lifecycle.
         * @return {tween.Events}
         */
        get events() {
            this.throwIfDisposed();
            return this._triggers.events;
        }
        /**
         * Adds an object to the behavior.
         * @throws `InvalidOperationException` if the tween has already been started.
         * @param {T} target
         * @param {Partial<NumericValues<T>>} endValues
         * @param {tween.EasingFunction | undefined} easing
         * @return {this}
         */
        add(target, endValues, easing = this._behavior.settings.easing) {
            this.throwIfDisposed();
            const ranges = this._ranges;
            if (ranges) {
                let pr = ranges.get(easing);
                if (!pr)
                    ranges.set(easing, pr = []);
                pr.push(new PropertyRange(target, endValues));
            }
            else
                throw new InvalidOperationException('Adding more targets to an active tween is not supported.');
            return this;
        }
        /**
         * Allows for tweens to occur in sequence.
         * @throws `InvalidOperationException` if the tween has already been started.
         * @param {tween.Behavior} behavior
         * @return {tween.Config}
         */
        chain(behavior) {
            this.throwIfDisposed();
            if (!this._chained)
                throw new InvalidOperationException('Adding more targets to an active tween is not supported.');
            const config = new Config(behavior || this._behavior, this._addActive);
            this._chained.push(config);
            return config;
        }
        /**
         * Starts the tween.
         * @param {TimeFrame} timeFrame
         * @return {Active}
         */
        start(timeFrame) {
            var _a;
            this.throwIfDisposed();
            if (this._active)
                throw new InvalidOperationException('Starting a tween more than once is not supported.');
            if (!timeFrame) {
                const duration = this._behavior.settings.duration;
                if (typeof duration != 'number' || isNaN(duration))
                    throw new ArgumentException('duration', 'Is not a number value. Should be the number of desired milliseconds.');
                const delay = (_a = this._behavior.settings.delay) !== null && _a !== void 0 ? _a : 0;
                timeFrame = new TimeFrame(duration, delay + Date.now());
            }
            const _ = this, triggers = _._triggers, ranges = _._ranges, chained = _._chained;
            _._chained = _._ranges = undefined;
            for (const r of ranges.values())
                for (const p of r)
                    p.init();
            triggers.started.publish();
            return this._active = this._addActive((id) => {
                const tween = new Active(id, timeFrame, ranges, triggers);
                triggers.completed.addPost().dispatcher.add(() => {
                    for (const next of chained)
                        next.start();
                    chained.length = 0;
                });
                return tween;
            });
        }
        _onDispose() {
            this._triggers.disposed.publish(false); // This event can only fire once.
            this._triggers.dispose();
            const c = this._chained, r = this._ranges;
            this._chained = this._ranges = undefined;
            if (c)
                for (const d of c)
                    d.dispose();
            if (r)
                for (const d of r.values())
                    for (const p of d)
                        p.dispose();
        }
    }
    tween_1.Config = Config;
    class Active extends TimeFrameEvents {
        constructor(id, timeFrame, ranges, triggers) {
            super(timeFrame, triggers);
            this.id = id;
            this._disposableObjectName = 'tween.Active';
            Object.freeze(this);
            const easedRanges = [];
            ranges.forEach((v, k) => easedRanges.push([k, v]));
            /*
             * We use the 'pre update' to actually do the work
             * so that listeners of the actual event can react to changed values.
             */
            const updated = triggers.updated.addPre().dispatcher;
            updated.add(value => {
                for (const e of easedRanges) {
                    const f = e[0];
                    const v = f ? f(value) : value, p = e[1];
                    for (const r of p)
                        r.update(v);
                }
            });
            triggers.disposed.dispatcher.add(() => {
                for (const e of easedRanges) {
                    const p = e[1];
                    for (const r of p)
                        r.dispose();
                    p.length = 0;
                }
                easedRanges.length = 0;
            });
        }
    }
    tween_1.Active = Active;
})(tween || (tween = {}));
export default tween.Factory;
//# sourceMappingURL=TweenFactory.js.map