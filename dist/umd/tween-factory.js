(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tsdotnet/disposable'), require('@tsdotnet/event-factory'), require('@tsdotnet/exceptions'), require('@tsdotnet/ordered-registry')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tsdotnet/disposable', '@tsdotnet/event-factory', '@tsdotnet/exceptions', '@tsdotnet/ordered-registry'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.tsdotnet = global.tsdotnet || {}, global.tsdotnet.tweenFactory = global.tsdotnet.tweenFactory || {}), global.tsdotnet.disposable, global.tsdotnet.eventFactory, global.tsdotnet.exceptions, global.tsdotnet.orderedRegistry));
})(this, (function (exports, disposable, eventFactory, exceptions, orderedRegistry) { 'use strict';

    /*!
     * @author electricessence / https://github.com/electricessence/
     * @license MIT
     */
    const ITEM = 'item', END_VALUES = 'endValues';
    const activeRanges = new WeakMap();
    class ActivePropertyRange extends disposable.DisposableBase {
        property;
        range;
        item;
        disposed;
        constructor(item, property, range) {
            if (!item)
                throw new exceptions.ArgumentNullException('item');
            const d = new eventFactory.EventDispatcher();
            super(() => {
                const ar = activeRanges.get(item);
                const a = ar?.get(property);
                if (a === this)
                    ar.delete(property);
                this.item = undefined;
                d.dispatch();
                d.dispose();
            });
            this.property = property;
            this.range = range;
            this.disposed = d.event;
            this.item = item;
            let ar = activeRanges.get(item);
            if (ar)
                ar.get(property)?.dispose();
            else
                activeRanges.set(item, ar = new Map());
            ar.set(property, this);
        }
        update(rangeValue) {
            this.assertIsAlive();
            const range = this.range;
            this.item[this.property] = range.start + range.delta * rangeValue;
        }
    }
    class PropertyRange extends disposable.DisposableBase {
        _item;
        _keys;
        _activeRanges;
        _endValues;
        constructor(item, endValues) {
            super();
            if (item == null)
                throw new exceptions.ArgumentNullException(ITEM);
            if (endValues == null)
                throw new exceptions.ArgumentNullException(END_VALUES);
            const keys = Object.keys(endValues);
            const values = {};
            for (const key of keys) {
                const value = assertNumber(END_VALUES, endValues, key);
                if (isNaN(value))
                    continue;
                values[key] = value;
            }
            this._item = item;
            this._endValues = Object.freeze(values);
            this._keys = keys;
        }
        init(startValues) {
            this.assertIsAlive(true);
            const item = this._item, endValues = this._endValues, ranges = new Map();
            for (const property of Object.keys(endValues)) {
                const start = startValues && property in startValues
                    ? assertNumber('startValues', startValues, property)
                    : assertNumber(ITEM, item, property);
                const end = endValues[property];
                if (start === end)
                    continue;
                const delta = end - start;
                const apr = new ActivePropertyRange(item, property, Object.freeze({ start, delta, end }));
                apr.disposed.add(() => ranges.delete(property));
                ranges.set(property, apr);
            }
            this._activeRanges = ranges;
            return ranges.size;
        }
        update(range) {
            this.assertIsAlive();
            const ranges = this._activeRanges;
            if (!ranges)
                throw 'PropertyRange was not initialized.  Call .init() before updating.';
            const keys = this._keys;
            if (!keys || !keys.length)
                return;
            let keysShifted = false;
            for (const key of keys) {
                const r = ranges.get(key);
                if (r)
                    r.update(range);
                else
                    keysShifted = true;
            }
            if (keysShifted) {
                this._keys = keys.filter(k => ranges.has(k));
                if (!this._keys.length)
                    this._keys = undefined;
            }
        }
        _onDispose() {
            this._item = undefined;
            const ar = this._activeRanges;
            this._activeRanges = undefined;
            if (ar) {
                const ranges = [];
                for (const r of ar.values())
                    ranges.push(r);
                for (const r of ranges)
                    r.dispose();
            }
            this._endValues = undefined;
        }
    }
    function assertNumber(name, item, property) {
        const value = item[property];
        if (typeof value != 'number')
            throw `'${name}.${property}' must be a number value.`;
        return value;
    }

    /*!
     * @author electricessence / https://github.com/electricessence/
     * @license MIT
     */
    class TimeFrame {
        range;
        constructor(duration, startTime = Date.now()) {
            if (isNaN(duration))
                throw new exceptions.ArgumentException('duration', 'Is not a number value. Should be the number of desired milliseconds.');
            if (isNaN(startTime))
                throw new exceptions.ArgumentException('startTime', 'Is not a number value. Should be the number of desired milliseconds.');
            if (duration < 0)
                throw new exceptions.ArgumentOutOfRangeException('duration', duration, 'Cannot be negative.');
            if (!isFinite(duration))
                throw new exceptions.ArgumentOutOfRangeException('duration', duration, 'Must be a finite number.');
            if (!isFinite(startTime))
                throw new exceptions.ArgumentOutOfRangeException('startTime', startTime, 'Must be a finite number.');
            this.range = Object.freeze({ start: startTime, delta: duration, end: startTime + duration });
            Object.freeze(this);
        }
        get position() {
            return this.getPositionOf(Date.now());
        }
        get progress() {
            return this.getProgressOf(Date.now());
        }
        getPositionOf(time) {
            const _ = this.range;
            return (time - _.start) / _.delta;
        }
        getProgressOf(time) {
            const _ = this.range;
            if (time < _.start)
                return 0;
            if (time > _.end)
                return 1;
            const progress = time - _.start, range = progress / _.delta;
            if (range < 0)
                return 0;
            if (range > 1)
                return 1;
            return range;
        }
        getValueOf(range) {
            return this.range.start + this.range.delta * range;
        }
    }

    /*!
     * @author electricessence / https://github.com/electricessence/
     * @license MIT
     */
    const MILLISECONDS_NAN = 'Is not a number value. Should be the number of desired milliseconds.';
    class Events {
        started;
        updated;
        completed;
        disposed;
        constructor(started, updated, completed, disposed) {
            this.started = started;
            this.updated = updated;
            this.completed = completed;
            this.disposed = disposed;
            Object.freeze(this);
        }
    }
    class Triggers {
        started = new eventFactory.EventPublisher(1);
        updated = new eventFactory.EventPublisher();
        completed = new eventFactory.EventPublisher(1);
        disposed = new eventFactory.EventPublisher(1);
        events;
        constructor() {
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
    class TimeFrameEvents extends disposable.DisposableBase {
        _timeFrame;
        _triggers;
        _state = { lastUpdate: NaN, complete: false };
        constructor(_timeFrame, _triggers) {
            super();
            this._timeFrame = _timeFrame;
            this._triggers = _triggers;
            _triggers.disposed.dispatcher.add(() => {
                _triggers.updated.remaining = 0;
                Object.freeze(this._state);
            });
        }
        get timeFrame() { return this._timeFrame; }
        get events() {
            return this._triggers.events;
        }
        get lastUpdate() {
            return this._state.lastUpdate;
        }
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
    function isTweenable(settings) {
        const { delay, duration, easing } = settings;
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
        if (typeof duration !== 'number')
            throw new TypeError(sd);
        if (isNaN(duration))
            throw new exceptions.ArgumentException(sd, MILLISECONDS_NAN);
        if (duration < 0)
            throw new exceptions.ArgumentOutOfRangeException(sd, duration, 'Must be no less than zero.');
        if (!isFinite(duration))
            throw new exceptions.ArgumentOutOfRangeException(sd, duration, 'Must be a finite value.');
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
        settings;
        _addActive;
        constructor(settings, _addActive) {
            this.settings = settings;
            this._addActive = _addActive;
            Object.freeze(settings);
        }
        configure(settings) {
            return Object.freeze(config({
                delay: settings.delay ?? this.settings.delay,
                duration: settings.duration ?? this.settings.duration,
                easing: settings.easing ?? this.settings.easing
            }, this._addActive));
        }
        delay(milliSeconds) {
            return this.configure({ delay: milliSeconds });
        }
        duration(milliSeconds) {
            return this.configure({ duration: milliSeconds });
        }
        easing(fn) {
            return this.configure({ easing: fn });
        }
    }
    class Behavior extends BehaviorBuilder {
        constructor(settings, addActive) {
            super(settings, addActive);
        }
        add(target, endValues, easing = this.settings.easing) {
            const starter = new Tween(this.settings, this._addActive);
            starter.add(target, endValues, easing);
            return starter;
        }
        tween(target, endValues, easing) {
            return this.add(target, endValues, easing).start();
        }
        tweenDeltas(target, endValues, easing) {
            return this.add(target, endValues, easing).start(undefined, true);
        }
    }
    class Manager {
        _activeTweens;
        _intervalCancel;
        constructor(_activeTweens) {
            this._activeTweens = _activeTweens;
        }
        update() {
            for (const tween of this._activeTweens.values.toArray())
                tween.update();
        }
        cancel() {
            for (const d of this._activeTweens.values.toArray())
                d.dispose();
            this._activeTweens.clear();
        }
        clearInterval() {
            const cancel = this._intervalCancel;
            if (cancel)
                cancel();
            return this;
        }
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
        updateOnInterval(milliseconds) {
            if (!(milliseconds >= 0))
                throw new exceptions.ArgumentOutOfRangeException('milliseconds', milliseconds, 'Must be no less than zero.');
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
    class Factory extends BehaviorBuilder {
        active;
        _activeTweens = new orderedRegistry.OrderedAutoRegistry();
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
            this.active = new Manager(this._activeTweens);
            Object.freeze(this);
        }
        dispose() {
            this.active.clearInterval();
            this.active.cancel();
        }
        clearInterval() {
            this.active.clearInterval();
            return this;
        }
        updateOnAnimationFrame() {
            this.active.updateOnAnimationFrame();
            return this;
        }
        updateOnInterval(milliseconds) {
            this.active.updateOnInterval(milliseconds);
            return this;
        }
    }
    class TweenableFactory extends Factory {
        add(target, endValues, easing = this.settings.easing) {
            const tween = new Tween(this.settings, this._addActive);
            tween.add(target, endValues, easing);
            return tween;
        }
        tween(target, endValues, easing) {
            return this.add(target, endValues, easing).start();
        }
        tweenDeltas(target, endValues, easing) {
            return this.add(target, endValues, easing).start(undefined, true);
        }
    }
    class Tween extends disposable.DisposableBase {
        _settings;
        _addActive;
        _ranges = new Map();
        _triggers = new Triggers();
        _chained = [];
        _active;
        constructor(_settings, _addActive) {
            super();
            this._settings = _settings;
            this._addActive = _addActive;
        }
        get events() {
            this.assertIsAlive();
            return this._triggers.events;
        }
        add(target, endValues, easing = this._settings.easing) {
            this.assertIsAlive(true);
            const ranges = this._ranges;
            if (ranges) {
                let pr = ranges.get(easing);
                if (!pr)
                    ranges.set(easing, pr = []);
                pr.push(new PropertyRange(target, endValues));
            }
            else
                throw new exceptions.InvalidOperationException('Adding more targets to an active tween is not supported.');
            return this;
        }
        chain(settings) {
            this.assertIsAlive(true);
            if (settings)
                isTweenable(settings);
            if (!this._chained)
                throw new exceptions.InvalidOperationException('Adding more targets to an active tween is not supported.');
            const tween = new Tween(settings && Object.freeze(copySettings(settings)) || this._settings, this._addActive);
            this._chained.push(tween);
            return tween;
        }
        start(timeFrame, deltasOnly = false) {
            this.assertIsAlive(true);
            if (this._active)
                throw new exceptions.InvalidOperationException('Starting a tween more than once is not supported.');
            if (!timeFrame) {
                const duration = this._settings.duration;
                const delay = this._settings.delay || 0;
                timeFrame = new TimeFrame(duration, (isNaN(delay) ? 0 : delay) + Date.now());
            }
            const _ = this, triggers = _._triggers, ranges = _._ranges, chained = _._chained;
            const filteredRanges = [];
            ranges.forEach((v, k) => {
                const prs = [];
                for (const p of v)
                    if (p.init())
                        prs.push(p);
                if (prs.length)
                    filteredRanges.push([k, prs]);
                v.length = 0;
            });
            if (deltasOnly && !filteredRanges.length)
                return undefined;
            _._chained = _._ranges = undefined;
            ranges.clear();
            triggers.started.publish();
            return this._active = this._addActive((id) => {
                const tween = new ActiveTween(id, timeFrame, filteredRanges, triggers);
                triggers.completed.addPost().dispatcher.add(() => {
                    for (const next of chained)
                        next.start();
                    chained.length = 0;
                });
                return tween;
            });
        }
        _onDispose() {
            this._triggers.disposed.publish(false);
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
        id;
        constructor(id, timeFrame, ranges, triggers) {
            super(timeFrame, triggers);
            this.id = id;
            Object.freeze(this);
            const updated = triggers.updated.addPre().dispatcher;
            if (ranges.length) {
                const [fn, prs] = ranges[0];
                if (ranges.length == 1) {
                    if (fn) {
                        updated.add(value => {
                            const v = fn(value);
                            for (const r of prs)
                                r.update(v);
                        });
                    }
                    else {
                        updated.add(value => {
                            for (const r of prs)
                                r.update(value);
                        });
                    }
                }
                else {
                    updated.add(value => {
                        for (const e of ranges) {
                            const fn = e[0];
                            const v = fn ? fn(value) : value, p = e[1];
                            for (const r of p)
                                r.update(v);
                        }
                    });
                }
            }
            triggers.disposed.dispatcher.add(() => {
                for (const e of ranges) {
                    const p = e[1];
                    for (const r of p)
                        r.dispose();
                    p.length = 0;
                }
                ranges.length = 0;
            });
        }
    }
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
                    break;
                return isTweenable(defaultSettings)
                    ? new TweenableFactory(copySettings(defaultSettings))
                    : new Factory(copyOptionalSettings(defaultSettings));
        }
        throw new Error('Unable to resolve configuration.');
    }

    exports.default = tweenFactory;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tween-factory.js.map
