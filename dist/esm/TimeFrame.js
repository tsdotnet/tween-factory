import { ArgumentException, ArgumentOutOfRangeException } from '@tsdotnet/exceptions';

/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
class TimeFrame {
    range;
    constructor(duration, startTime = Date.now()) {
        if (isNaN(duration))
            throw new ArgumentException('duration', 'Is not a number value. Should be the number of desired milliseconds.');
        if (isNaN(startTime))
            throw new ArgumentException('startTime', 'Is not a number value. Should be the number of desired milliseconds.');
        if (duration < 0)
            throw new ArgumentOutOfRangeException('duration', duration, 'Cannot be negative.');
        if (!isFinite(duration))
            throw new ArgumentOutOfRangeException('duration', duration, 'Must be a finite number.');
        if (!isFinite(startTime))
            throw new ArgumentOutOfRangeException('startTime', startTime, 'Must be a finite number.');
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

export { TimeFrame as default };
//# sourceMappingURL=TimeFrame.js.map
