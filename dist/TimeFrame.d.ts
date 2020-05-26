/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
export default class TimeFrame {
    private readonly _startTime;
    private readonly _duration;
    private readonly _endTime;
    constructor(duration: number, startTime?: number);
    get startTime(): number;
    get duration(): number;
    get endTime(): number;
    /**
     * A number from 0 to 1 representing the progress of the time frame.
     * @return {number}
     */
    get progress(): number;
}
