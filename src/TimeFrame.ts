/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';

export default class TimeFrame
{
	readonly startTime: number;
	readonly endTime: number;

	constructor (readonly duration: number)
	{
		if(isNaN(duration))
			throw new ArgumentException('duration', 'Is not a number value. Should be the number of desired milliseconds.');

		const now = Date.now();
		this.startTime = now;
		this.endTime = now + duration;
	}

	get progress (): number
	{
		return this.getProgress();
	}

	getProgress (): number
	{
		const _ = this, now = Date.now();
		if(now<_.startTime) return 0;
		if(now>_.endTime) return 1;

		const
			progress = now - _.startTime,
			range    = progress/_.duration;

		// Beware precision issues.
		if(range<0) return 0;
		if(range>1) return 1;
		return range;
	}
}
