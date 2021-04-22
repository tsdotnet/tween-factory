/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */

const s = 1.70158;
const s2 = 1.70158*1.525;

namespace back
{
	export function easeIn (k: number): number
	{
		return k*k*((s + 1)*k - s);
	}

	export function easeOut (k: number): number
	{
		return --k*k*((s + 1)*k + s) + 1;
	}

	export function easeInOut (k: number): number
	{
		if((k *= 2)<1) return 0.5*(k*k*((s2 + 1)*k - s2));
		return 0.5*((k -= 2)*k*((s2 + 1)*k + s2) + 2);
	}
}

Object.freeze(back);
export default back;
