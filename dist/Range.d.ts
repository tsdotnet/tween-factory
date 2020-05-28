/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

export interface StartAndEnd<T>
{
	start: T;
	end: T;
}

export interface Range<T = number, TDelta = T>
	extends StartAndEnd<T>
{
	delta: TDelta;
}


