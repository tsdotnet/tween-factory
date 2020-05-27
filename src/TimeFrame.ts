/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import ArgumentOutOfRangeException from '@tsdotnet/exceptions/dist/ArgumentOutOfRangeException';

export default class TimeFrame
{
	private readonly _startTime: number;
	private readonly _duration: number;
	private readonly _endTime: number;

	constructor (duration: number, startTime: number = Date.now())
	{
		if(isNaN(duration)) throw new ArgumentException('duration', 'Is not a number value. Should be the number of desired milliseconds.');
		if(duration<0) throw new ArgumentOutOfRangeException('duration', duration, 'Cannot be negative.');
		if(!isFinite(duration)) throw new ArgumentOutOfRangeException('duration', duration, 'Must be a finite number.');
		this._duration = duration;
		this._startTime = startTime;
		this._endTime = startTime + duration;
	}

	get startTime (): number { return this._startTime; }

	get duration (): number { return this._duration; }

	get endTime (): number { return this._endTime; }

	/**
	 * A number from 0 to 1 representing the progress of the time frame.
	 * @return {number}
	 */
	get progress (): number
	{
		const _ = this, now = Date.now();
		if(now<_._startTime) return 0;
		if(now>_._endTime) return 1;

		const
			progress = now - _._startTime,
			range    = progress/_._duration;

		// Beware precision issues.
		if(range<0) return 0;
		if(range>1) return 1;
		return range;
	}
}