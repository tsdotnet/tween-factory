/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
export default class TimeFrame {
    readonly duration: number;
    readonly startTime: number;
    readonly endTime: number;
    constructor(duration: number);
    get progress(): number;
    getProgress(): number;
}
