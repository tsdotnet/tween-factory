"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
class TimeFrame {
    constructor(duration) {
        this.duration = duration;
        if (isNaN(duration))
            throw 'Duration is not a number value. Should be the number of desired milliseconds.';
        const now = Date.now();
        this.startTime = now;
        this.endTime = now + duration;
    }
    get progress() {
        return this.getProgress();
    }
    getProgress() {
        const _ = this, now = Date.now();
        if (now < _.startTime)
            return 0;
        if (now > _.endTime)
            return 1;
        const progress = now - _.startTime, range = progress / _.duration;
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