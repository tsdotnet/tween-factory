/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */

export namespace exponential
{
	export function easeIn (k: number): number
	{
		return k===0 ? 0 : Math.pow(1024, k - 1);
	}

	export function easeOut (k: number): number
	{
		return k===1 ? 1 : 1 - Math.pow(2, -10*k);
	}

	export function easeInOut (k: number): number
	{
		if(k===0 || k===1) return k;
		if((k *= 2)<1) return 0.5*Math.pow(1024, k - 1);
		return 0.5*(-Math.pow(2, -10*(k - 1)) + 2);
	}
}

Object.freeze(exponential);
export default exponential;
