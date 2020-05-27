"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ArgumentException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentException"));
const ArgumentOutOfRangeException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentOutOfRangeException"));
class TimeFrame {
    constructor(duration, startTime = Date.now()) {
        if (isNaN(duration))
            throw new ArgumentException_1.default('duration', 'Is not a number value. Should be the number of desired milliseconds.');
        if (isNaN(startTime))
            throw new ArgumentException_1.default('startTime', 'Is not a number value. Should be the number of desired milliseconds.');
        if (duration < 0)
            throw new ArgumentOutOfRangeException_1.default('duration', duration, 'Cannot be negative.');
        if (!isFinite(duration))
            throw new ArgumentOutOfRangeException_1.default('duration', duration, 'Must be a finite number.');
        if (!isFinite(startTime))
            throw new ArgumentOutOfRangeException_1.default('startTime', startTime, 'Must be a finite number.');
        this._duration = duration;
        this._startTime = startTime;
        this._endTime = startTime + duration;
        Object.freeze(this);
    }
    get startTime() { return this._startTime; }
    get duration() { return this._duration; }
    get endTime() { return this._endTime; }
    /**
     * An unbound ratio representing where now is in relation to the time-frame where:
     * Less than zero is before start, and greater than 1 is after start.
     * @return {number}
     */
    get position() {
        const _ = this, now = Date.now();
        return (now - _._startTime) / _._duration;
    }
    /**
     * A number from 0 to 1 representing the progress of the time frame.
     * @return {number}
     */
    get progress() {
        const _ = this, now = Date.now();
        if (now < _._startTime)
            return 0;
        if (now > _._endTime)
            return 1;
        const progress = now - _._startTime, range = progress / _._duration;
        // Beware precision issues.
        if (range < 0)
            return 0;
        if (range > 1)
            return 1;
        return range;
    }
}
exports.default = TimeFrame;
//# sourceMappingURL=TimeFrame.js.map