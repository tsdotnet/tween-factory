/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */

namespace bounce
{
	export function easeIn (k: number): number
	{
		return 1 - easeOut(1 - k);
	}

	export function easeOut (k: number): number
	{
		if(k<(1/2.75))
		{
			return 7.5625*k*k;
		}
		else if(k<(2/2.75))
		{
			return 7.5625*(k -= (1.5/2.75))*k + 0.75;
		}
		else if(k<(2.5/2.75))
		{
			return 7.5625*(k -= (2.25/2.75))*k + 0.9375;
		}
		else
		{
			return 7.5625*(k -= (2.625/2.75))*k + 0.984375;
		}
	}

	export function easeInOut (k: number): number
	{
		if(k<0.5) return easeIn(k*2)*0.5;
		return easeOut(k*2 - 1)*0.5 + 0.5;
	}

}

export default Object.freeze(bounce);
