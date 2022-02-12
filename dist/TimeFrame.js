"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ArgumentException_1 = (0, tslib_1.__importDefault)(require("@tsdotnet/exceptions/dist/ArgumentException"));
const ArgumentOutOfRangeException_1 = (0, tslib_1.__importDefault)(require("@tsdotnet/exceptions/dist/ArgumentOutOfRangeException"));
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
        this.range = Object.freeze({ start: startTime, delta: duration, end: startTime + duration });
        Object.freeze(this);
    }
    /**
     * An unbound ratio representing where now is in relation to the time-frame where:
     * Less than zero is before start, and greater than 1 is after start.
     * @return {number}
     */
    get position() {
        return this.getPositionOf(Date.now());
    }
    /**
     * A number from 0 to 1 representing the progress of the time frame.
     * @return {number}
     */
    get progress() {
        return this.getProgressOf(Date.now());
    }
    /**
     * An unbound ratio representing where the `time` value is in relation to the time-frame where:
     * Less than zero is before start, and greater than 1 is after start.
     * @param {number} time
     * @return {number}
     */
    getPositionOf(time) {
        const _ = this.range;
        return (time - _.start) / _.delta;
    }
    /**
     * A number from 0 to 1 representing where the `time` value is in relation to the time frame.
     * @param {number} time
     * @return {number}
     */
    getProgressOf(time) {
        const _ = this.range;
        if (time < _.start)
            return 0;
        if (time > _.end)
            return 1;
        const progress = time - _.start, range = progress / _.delta;
        // Beware precision issues.
        if (range < 0)
            return 0;
        if (range > 1)
            return 1;
        return range;
    }
    /**
     * The time value based up on the range value provided.
     * @param {number} range Less than zero is before start, and greater than 1 is after start.
     * @return {number} The `time` at which the provided range value represents.
     */
    getValueOf(range) {
        return this.range.start + this.range.delta * range;
    }
}
exports.default = TimeFrame;
//# sourceMappingURL=TimeFrame.js.map