/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import type tweening from './Tweening.js';
export { type tweening };
export { type default as Range } from './Range.js';
export default function tweenFactory(defaultEasing: tweening.EasingFunction): tweening.FactoryBuilder;
export default function tweenFactory(defaultDuration: number, defaultEasing?: tweening.EasingFunction): tweening.Factory;
export default function tweenFactory(defaultSettings: tweening.Settings): tweening.Factory;
export default function tweenFactory(defaultSettings?: tweening.OptionalSettings): tweening.FactoryBuilder;
