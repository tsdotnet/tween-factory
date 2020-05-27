"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tween = exports.tweening = void 0;
const tslib_1 = require("tslib");
const disposable_1 = require("@tsdotnet/disposable");
const EventPublisher_1 = tslib_1.__importDefault(require("@tsdotnet/event-factory/dist/EventPublisher"));
const ArgumentException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentException"));
const InvalidOperationException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/InvalidOperationException"));
const ordered_registry_1 = require("@tsdotnet/ordered-registry");
const PropertyRange_1 = tslib_1.__importDefault(require("./PropertyRange"));
const TimeFrame_1 = tslib_1.__importDefault(require("./TimeFrame"));
class TweenConfigBase {
    constructor(settings = {}, _addActive) {
        this.settings = settings;
        this._addActive = _addActive;
    }
    configure(settings) {
        var _a, _b, _c;
        return new tweening.Behavior({
            delay: (_a = settings.delay) !== null && _a !== void 0 ? _a : this.settings.delay,
            duration: (_b = settings.duration) !== null && _b !== void 0 ? _b : this.settings.duration,
            easing: (_c = settings.easing) !== null && _c !== void 0 ? _c : this.settings.easing
        }, this._addActive);
    }
    /**
     * Configures a tween behavior with the specified delay.
     * @param {number} milliSeconds
     * @return {tweening.Behavior}
     */
    delay(milliSeconds) {
        return this.configure({ delay: milliSeconds });
    }
    /**
     * Configures a tween behavior with the specified duration.
     * @param {number} milliSeconds
     * @return {tweening.Behavior}
     */
    duration(milliSeconds) {
        return this.configure({ duration: milliSeconds });
    }
    /**
     * Configures a tween behavior with the specified easing function.
     * @param {EasingFunction} fn
     * @return {tweening.Behavior}
     */
    easing(fn) {
        return this.configure({ easing: fn });
    }
}
/**
 * A class for configuring groups of tweens and signaling their updates.
 */
class TweenFactory extends TweenConfigBase {
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
        this._activeTweens = new ordered_registry_1.OrderedAutoRegistry();
    }
    /**
     * Triggers updates for all active tweens.
     */
    update() {
        for (const tween of this._activeTweens.values.toArray()) {
            tween.update();
        }
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
exports.default = TweenFactory;
var tweening;
(function (tweening) {
    class Behavior extends TweenConfigBase {
        constructor(settings, addActive) {
            super(settings, addActive);
            Object.freeze(this);
        }
        /**
         * Adds an object to the behavior.
         * @param target
         * @param endValues
         */
        add(target, endValues) {
            const starter = new Config(this, this._addActive);
            starter.add(target, endValues);
            return starter;
        }
    }
    tweening.Behavior = Behavior;
    class Config extends disposable_1.DisposableBase {
        constructor(_behavior, _addActive) {
            super('tweening.Config');
            this._behavior = _behavior;
            this._addActive = _addActive;
            this._ranges = [];
            this._triggers = new Triggers();
            this._chained = [];
        }
        /**
         * Events that will be triggered during the tween lifecycle.
         * @return {tweening.Events}
         */
        get events() {
            this.throwIfDisposed();
            return this._triggers.events;
        }
        /**
         * Adds an object to the behavior.
         * @throws `InvalidOperationException` if the tween has already been started.
         * @param target
         * @param endValues
         */
        add(target, endValues) {
            this.throwIfDisposed();
            if (this._ranges)
                this._ranges.push(new PropertyRange_1.default(target, endValues));
            else
                throw new InvalidOperationException_1.default('Adding more targets to an active tween is not supported.');
            return this;
        }
        /**
         * Allows for tweens to occur in sequence.
         * @throws `InvalidOperationException` if the tween has already been started.
         * @param {tweening.Behavior} behavior
         * @return {tweening.Config}
         */
        chain(behavior) {
            this.throwIfDisposed();
            if (!this._chained)
                throw new InvalidOperationException_1.default('Adding more targets to an active tween is not supported.');
            const config = new Config(behavior || this._behavior, this._addActive);
            this._chained.push(config);
            return config;
        }
        /**
         * Starts the tween.
         * @return {Tween}
         */
        /**
         * Starts the tween.
         * @param {TimeFrame} timeFrame
         * @return {Tween}
         */
        start(timeFrame) {
            var _a;
            this.throwIfDisposed();
            if (this._active)
                throw new InvalidOperationException_1.default('Starting a tween more than once is not supported.');
            if (!timeFrame) {
                const duration = this._behavior.settings.duration;
                if (typeof duration != 'number' || isNaN(duration))
                    throw new ArgumentException_1.default('duration', 'Is not a number value. Should be the number of desired milliseconds.');
                const delay = (_a = this._behavior.settings.delay) !== null && _a !== void 0 ? _a : 0;
                timeFrame = new TimeFrame_1.default(duration, delay + Date.now());
            }
            const _ = this, behavior = _._behavior, triggers = _._triggers, ranges = _._ranges, chained = _._chained;
            _._chained = _._ranges = undefined;
            for (const r of ranges)
                r.init();
            triggers.started.publish();
            return this._active = this._addActive((id) => {
                const tween = new Tween(id, timeFrame, behavior, ranges, triggers);
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
                for (const d of r)
                    d.dispose();
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
    dispose() {
        this.started.dispose();
        this.updated.dispose();
        this.completed.dispose();
        this.disposed.dispose();
    }
}
class TimeFrameEvents {
    constructor(_timeFrame, _triggers) {
        this._timeFrame = _timeFrame;
        this._triggers = _triggers;
        this._lastUpdate = NaN;
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
        return this._lastUpdate;
    }
    /**
     * Updates the state and triggers events accordingly.
     * @return {number}
     */
    update() {
        this._lastUpdate = Date.now();
        const value = this._timeFrame.progress, e = this._triggers, u = e.updated;
        u.publish(value);
        if (value == 1) {
            u.remaining = 0;
            e.completed.publish();
            e.disposed.publish(true);
        }
        return value;
    }
    /**
     * Forces completion and calls dispose(true).
     */
    complete() {
        const e = this._triggers, u = e.updated;
        u.publish(1);
        u.remaining = 0;
        e.completed.publish();
        e.disposed.publish(true);
    }
    /**
     * Disposes the tween.  All updates are arrested and dispose will signal completion progress.
     */
    dispose() {
        this._triggers.disposed.publish(this._timeFrame.progress == 1);
    }
}
class Tween extends TimeFrameEvents {
    constructor(id, timeFrame, behavior, ranges, triggers) {
        super(timeFrame, triggers);
        this.id = id;
        /*
         * We use the 'pre update' to actually do the work
         * so that listeners of the actual event can react to changed values.
         */
        const updated = triggers.updated.addPre().dispatcher;
        const easing = behavior.settings.easing;
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
        triggers.disposed.dispatcher.add(() => {
            for (const r of ranges)
                r.dispose();
            ranges.length = 0;
        });
    }
}
exports.Tween = Tween;
//# sourceMappingURL=TweenFactory.js.map