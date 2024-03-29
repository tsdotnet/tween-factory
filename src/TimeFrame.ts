/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import ArgumentOutOfRangeException from '@tsdotnet/exceptions/dist/ArgumentOutOfRangeException';
import {Range} from './Range';

export {Range};

export default class TimeFrame
{
	readonly range: Readonly<Range>;

	constructor (duration: number, startTime: number = Date.now())
	{
		if(isNaN(duration)) throw new ArgumentException('duration', 'Is not a number value. Should be the number of desired milliseconds.');
		if(isNaN(startTime)) throw new ArgumentException('startTime', 'Is not a number value. Should be the number of desired milliseconds.');
		if(duration<0) throw new ArgumentOutOfRangeException('duration', duration, 'Cannot be negative.');
		if(!isFinite(duration)) throw new ArgumentOutOfRangeException('duration', duration, 'Must be a finite number.');
		if(!isFinite(startTime)) throw new ArgumentOutOfRangeException('startTime', startTime, 'Must be a finite number.');
		this.range = Object.freeze({start: startTime, delta: duration, end: startTime + duration});
		Object.freeze(this);
	}

	/**
	 * An unbound ratio representing where now is in relation to the time-frame where:
	 * Less than zero is before start, and greater than 1 is after start.
	 * @return {number}
	 */
	get position (): number
	{
		return this.getPositionOf(Date.now());
	}

	/**
	 * A number from 0 to 1 representing the progress of the time frame.
	 * @return {number}
	 */
	get progress (): number
	{
		return this.getProgressOf(Date.now());
	}

	/**
	 * An unbound ratio representing where the `time` value is in relation to the time-frame where:
	 * Less than zero is before start, and greater than 1 is after start.
	 * @param {number} time
	 * @return {number}
	 */
	getPositionOf (time: number): number
	{
		const _ = this.range;
		return (time - _.start)/_.delta;
	}

	/**
	 * A number from 0 to 1 representing where the `time` value is in relation to the time frame.
	 * @param {number} time
	 * @return {number}
	 */
	getProgressOf (time: number): number
	{
		const _ = this.range;
		if(time<_.start) return 0;
		if(time>_.end) return 1;

		const
			progress = time - _.start,
			range    = progress/_.delta;

		// Beware precision issues.
		if(range<0) return 0;
		if(range>1) return 1;
		return range;
	}

	/**
	 * The time value based up on the range value provided.
	 * @param {number} range Less than zero is before start, and greater than 1 is after start.
	 * @return {number} The `time` at which the provided range value represents.
	 */
	getValueOf (range: number): number
	{
		return this.range.start + this.range.delta*range;
	}
}
