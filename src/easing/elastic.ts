/*! Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/ */

const p = 0.4;
let s: number, a = 0.1;
if(!a || a<1)
{
	a = 1;
	s = p/4;
}
else s = p*Math.asin(1/a)/(2*Math.PI);

export namespace elastic
{
	export function easeIn (k: number): number
	{
		if(k===0 || k===1) return k;
		return -a*Math.pow(2, 10*(k -= 1))*Math.sin((k - s)*(2*Math.PI)/p);
	}

	export function easeOut (k: number): number
	{
		if(k===0 || k===1) return k;
		return a*Math.pow(2, -10*k)*Math.sin((k - s)*(2*Math.PI)/p) + 1;
	}

	export function easeInOut (k: number): number
	{
		if(k===0 || k===1) return k;
		if((k *= 2)<1) return -0.5*a*Math.pow(2, 10*(k -= 1))*Math.sin((k - s)*(2*Math.PI)/p);
		return a*Math.pow(2, -10*(k -= 1))*Math.sin((k - s)*(2*Math.PI)/p)*0.5 + 1;
	}
}

Object.freeze(elastic);
export default elastic;
