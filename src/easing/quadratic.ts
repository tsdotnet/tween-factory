/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
/**
 * @packageDocumentation
 * @module easing
 */

export namespace quadratic
{
	export function easeIn (k: number): number
	{
		return k*k;
	}

	export function easeOut (k: number): number
	{
		return k*(2 - k);
	}

	export function easeInOut (k: number): number
	{
		if((k *= 2)<1) return 0.5*k*k;
		return -0.5*(--k*(k - 2) - 1);
	}
}

Object.freeze(quadratic);
export default quadratic;
