/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import type Range from './Range';
export { type Range };
export default class TimeFrame {
    readonly range: Readonly<Range>;
    constructor(duration: number, startTime?: number);
    get position(): number;
    get progress(): number;
    getPositionOf(time: number): number;
    getProgressOf(time: number): number;
    getValueOf(range: number): number;
}
