"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const disposable_1 = require("@tsdotnet/disposable");
const EventPublisher_1 = tslib_1.__importDefault(require("@tsdotnet/event-factory/dist/EventPublisher"));
const ArgumentException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentException"));
const ArgumentOutOfRangeException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentOutOfRangeException"));
const InvalidOperationException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/InvalidOperationException"));
const ordered_registry_1 = require("@tsdotnet/ordered-registry");
const PropertyRange_1 = tslib_1.__importDefault(require("./PropertyRange"));
const TimeFrame_1 = tslib_1.__importDefault(require("./TimeFrame"));
const MILLISECONDS_NAN = 'Is not a number value. Should be the number of desired milliseconds.';
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
class TimeFrameEvents extends disposable_1.DisposableBase {
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
    /**
     * Triggered by `dispose()` in super class (`DisposableBase`).
     * @private
     */
    _onDispose() {
        this._triggers.disposed.publish(this._timeFrame.progress == 1);
    }
}
function isTweenable(settings) {
    const { delay, duration, easing } = settings;
    // noinspection SuspiciousTypeOfGuard
    if (delay != null && typeof delay !== 'number')
        throw new TypeError('settings.delay is not a number');
    if (easing != null) {
        if (typeof easing !== 'function')
            throw new TypeError('settings.easing is not a function');
        if (typeof easing(0.5) !== 'number')
            throw new TypeError('settings.easing() does not return a number value');
    }
    if (duration == null)
        return false;
    const sd = 'settings.duration';
    // noinspection SuspiciousTypeOfGuard
    if (typeof duration !== 'number')
        throw new TypeError(sd);
    if (isNaN(duration))
        throw new ArgumentException_1.default(sd, MILLISECONDS_NAN);
    if (duration < 0)
        throw new ArgumentOutOfRangeException_1.default(sd, duration, 'Must be no less than zero.');
    if (!isFinite(duration))
        throw new ArgumentOutOfRangeException_1.default(sd, duration, 'Must be a finite value.');
    return true;
}
function assertTweenable(settings) {
    isTweenable(settings);
    return settings;
}
function copyOptionalSettings(settings) {
    return {
        delay: settings.delay,
        easing: settings.easing
    };
}
function copySettings(settings) {
    return {
        delay: settings.delay,
        duration: settings.duration,
        easing: settings.easing
    };
}
function config(settings, addActive) {
    return isTweenable(settings)
        ? new Behavior(settings, addActive)
        : new BehaviorBuilder(settings, addActive);
}
class BehaviorBuilder {
    constructor(settings, _addActive) {
        this.settings = settings;
        this._addActive = _addActive;
        Object.freeze(settings);
    }
    configure(settings) {
        var _a, _b, _c;
        return Object.freeze(config({
            delay: (_a = settings.delay) !== null && _a !== void 0 ? _a : this.settings.delay,
            duration: (_b = settings.duration) !== null && _b !== void 0 ? _b : this.settings.duration,
            easing: (_c = settings.easing) !== null && _c !== void 0 ? _c : this.settings.easing
        }, this._addActive));
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
class Behavior extends BehaviorBuilder {
    constructor(settings, addActive) {
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
    add(target, endValues, easing = this.settings.easing) {
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
    tween(target, endValues, easing) {
        return this.add(target, endValues, easing).start();
    }
}
class Manager {
    constructor(_activeTweens) {
        this._activeTweens = _activeTweens;
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
    cancel() {
        for (const d of this._activeTweens.values.toArray())
            d.dispose();
        this._activeTweens.clear();
    }
    /**
     * Causes any automatic updates to be cancelled.
     */
    clearInterval() {
        const cancel = this._intervalCancel;
        if (cancel)
            cancel();
        return this;
    }
    /**
     * Causes active tweens to automatically be updated on each animation frame.
     * Supported only where `requestAnimationFrame()` is available.
     */
    updateOnAnimationFrame() {
        const cancel = this._intervalCancel;
        if (cancel)
            cancel();
        let cancelled = false;
        this._intervalCancel = () => {
            cancelled = true;
            this._intervalCancel = undefined;
        };
        const update = () => {
            if (cancelled)
                return;
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
    updateOnInterval(milliseconds) {
        if (!(milliseconds >= 0))
            throw new ArgumentOutOfRangeException_1.default('milliseconds', milliseconds, 'Must be no less than zero.');
        const cancel = this._intervalCancel;
        if (cancel)
            cancel();
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
class Factory extends BehaviorBuilder {
    constructor(settings) {
        super(settings, (factory) => {
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
        this.active = new Manager(this._activeTweens);
        Object.freeze(this);
    }
    /**
     * Ensures intervals are cancelled and no tweens are active.
     */
    dispose() {
        this.active.clearInterval();
        this.active.cancel();
    }
    /**
     * Causes any automatic updates to be cancelled.
     */
    clearInterval() {
        this.active.clearInterval();
        return this;
    }
    /**
     * Causes active tweens to automatically be updated on each animation frame.
     * Supported only where `requestAnimationFrame()` is available.
     */
    updateOnAnimationFrame() {
        this.active.updateOnAnimationFrame();
        return this;
    }
    /**
     * Causes active tweens to automatically be updated on an interval.
     * @param {number} milliseconds
     */
    updateOnInterval(milliseconds) {
        this.active.updateOnInterval(milliseconds);
        return this;
    }
}
class TweenableFactory extends Factory {
    /**
     * Adds an object to the behavior.
     * @throws `InvalidOperationException` if the tween has already been started.
     * @param {T} target
     * @param {Partial<NumericValues<T>>} endValues
     * @param {tweening.EasingFunction | undefined} easing
     * @return {this}
     */
    add(target, endValues, easing = this.settings.easing) {
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
    tween(target, endValues, easing) {
        return this.add(target, endValues, easing).start();
    }
}
class Tween extends disposable_1.DisposableBase {
    constructor(_settings, _addActive) {
        super('Tween');
        this._settings = _settings;
        this._addActive = _addActive;
        this._ranges = new Map();
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
     * @param {T} target
     * @param {Partial<NumericValues<T>>} endValues
     * @param {tweening.EasingFunction | undefined} easing
     * @return {this}
     */
    add(target, endValues, easing = this._settings.easing) {
        this.throwIfDisposed();
        const ranges = this._ranges;
        if (ranges) {
            let pr = ranges.get(easing);
            if (!pr)
                ranges.set(easing, pr = []);
            pr.push(new PropertyRange_1.default(target, endValues));
        }
        else
            throw new InvalidOperationException_1.default('Adding more targets to an active tween is not supported.');
        return this;
    }
    /**
     * Allows for tweens to occur in sequence.
     * @throws `InvalidOperationException` if the tween has already been started.
     * @param {tweening.Settings} settings
     * @return {tweening.Tween}
     */
    chain(settings) {
        this.throwIfDisposed();
        if (settings)
            isTweenable(settings); // Validate.
        if (!this._chained)
            throw new InvalidOperationException_1.default('Adding more targets to an active tween is not supported.');
        const tween = new Tween(settings && Object.freeze(copySettings(settings)) || this._settings, this._addActive);
        this._chained.push(tween);
        return tween;
    }
    /**
     * Starts the tween.
     * @param {TimeFrame} timeFrame
     * @return {tweening.ActiveTween}
     */
    start(timeFrame) {
        this.throwIfDisposed();
        if (this._active)
            throw new InvalidOperationException_1.default('Starting a tween more than once is not supported.');
        if (!timeFrame) {
            const duration = this._settings.duration;
            const delay = this._settings.delay || 0;
            timeFrame = new TimeFrame_1.default(duration, (isNaN(delay) ? 0 : delay) + Date.now());
        }
        const _ = this, triggers = _._triggers, ranges = _._ranges, chained = _._chained;
        _._chained = _._ranges = undefined;
        for (const r of ranges.values())
            for (const p of r)
                p.init();
        triggers.started.publish();
        return this._active = this._addActive((id) => {
            const tween = new ActiveTween(id, timeFrame, ranges, triggers);
            triggers.completed.addPost().dispatcher.add(() => {
                for (const next of chained)
                    next.start();
                chained.length = 0;
            });
            return tween;
        });
    }
    /**
     * Triggered by `dispose()` in super class (`DisposableBase`).
     * @private
     */
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
class ActiveTween extends TimeFrameEvents {
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
/**
 * If a duration is provided, creates a `tweening.Factory`, else creates a `tweening.FactoryBuilder`.
 * @param {tweening.EasingFunction | tweening.OptionalSettings | tweening.Settings | number} defaultSettings
 * @param {tweening.EasingFunction} defaultEasing
 * @return {tweening.FactoryBuilder | tweening.Factory}
 */
function tweenFactory(defaultSettings, defaultEasing) {
    switch (typeof defaultSettings) {
        case 'number':
            return new TweenableFactory(assertTweenable({
                duration: defaultSettings,
                easing: defaultEasing
            }));
        case 'function':
            return new Factory(assertTweenable({ easing: defaultSettings }));
        case 'undefined':
            return new Factory(assertTweenable({ easing: defaultEasing }));
        case 'object':
            if (!defaultSettings)
                break; // null?
            return isTweenable(defaultSettings)
                ? new TweenableFactory(copySettings(defaultSettings))
                : new Factory(copyOptionalSettings(defaultSettings));
    }
    throw new Error('Unable to resolve configuration.');
}
exports.default = tweenFactory;
//# sourceMappingURL=TweenFactory.js.map