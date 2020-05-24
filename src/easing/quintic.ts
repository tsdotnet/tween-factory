/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */

namespace quintic
{
	export function easeIn (k: number): number
	{
		return k*k*k*k*k;
	}

	export function easeOut (k: number): number
	{
		return --k*k*k*k*k + 1;
	}

	export function easeInOut (k: number): number
	{
		if((k *= 2)<1) return 0.5*k*k*k*k*k;
		return 0.5*((k -= 2)*k*k*k*k + 2);
	}
}

export default Object.freeze(quintic);
