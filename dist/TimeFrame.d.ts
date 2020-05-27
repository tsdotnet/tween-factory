/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import { Range } from './Range';
export default class TimeFrame {
    readonly range: Readonly<Range>;
    constructor(duration: number, startTime?: number);
    /**
     * An unbound ratio representing where now is in relation to the time-frame where:
     * Less than zero is before start, and greater than 1 is after start.
     * @return {number}
     */
    get position(): number;
    /**
     * A number from 0 to 1 representing the progress of the time frame.
     * @return {number}
     */
    get progress(): number;
    /**
     * An unbound ratio representing where the `time` value is in relation to the time-frame where:
     * Less than zero is before start, and greater than 1 is after start.
     * @param {number} time
     * @return {number}
     */
    getPositionOf(time: number): number;
    /**
     * A number from 0 to 1 representing where the `time` value is in relation to the time frame.
     * @param {number} time
     * @return {number}
     */
    getProgressOf(time: number): number;
    /**
     * The time value based up on the range value provided.
     * @param {number} range Less than zero is before start, and greater than 1 is after start.
     * @return {number} The `time` at which the provided range value represents.
     */
    getValueOf(range: number): number;
}
