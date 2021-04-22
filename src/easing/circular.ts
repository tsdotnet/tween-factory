/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */
export namespace circular
{
	export function easeIn (k: number): number
	{
		return 1 - Math.sqrt(1 - k*k);
	}

	export function easeOut (k: number): number
	{
		return Math.sqrt(1 - (--k*k));
	}

	export function easeInOut (k: number): number
	{
		if((k *= 2)<1) return -0.5*(Math.sqrt(1 - k*k) - 1);
		return 0.5*(Math.sqrt(1 - (k -= 2)*k) + 1);
	}
}

Object.freeze(circular);
export default circular;
