export default function linear (v: number[], k: number): number {
	const m = v.length - 1, f = m*k, i = Math.floor(f);

	if(k<0) return fn(v[0], v[1], f);
	if(k>1) return fn(v[m], v[m - 1], m - f);

	return fn(v[i], v[i + 1>m ? m : i + 1], f - i);
}

function fn (p0: number, p1: number, t: number): number
{
	return (p1 - p0)*t + p0;
}
