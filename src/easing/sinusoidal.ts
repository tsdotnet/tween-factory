/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */

export namespace sinusoidal
{
	export function easeIn (k: number): number
	{
		return 1 - Math.cos(k*Math.PI/2);
	}

	export function easeOut (k: number): number
	{
		return Math.sin(k*Math.PI/2);
	}

	export function easeInOut (k: number): number
	{
		return 0.5*(1 - Math.cos(Math.PI*k));
	}

}
Object.freeze(sinusoidal);
export default sinusoidal;
