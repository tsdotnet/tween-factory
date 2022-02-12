/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
import tweening from './Tweening';
import EasingFunction = tweening.EasingFunction;
import OptionalSettings = tweening.OptionalSettings;
import Settings = tweening.Settings;
export { tweening };
/**
 * Creates a `tweening.FactoryBuilder` with the specified easing function as default.
 * @param {tweening.EasingFunction} defaultEasing
 * @return {tweening.FactoryBuilder}
 */
export default function tweenFactory(defaultEasing: EasingFunction): tweening.FactoryBuilder;
/**
 * Creates a `tweening.Factory` with the specified duration and optional easing function.
 * @param {number} defaultDuration
 * @param {tweening.EasingFunction} defaultEasing
 * @return {tweening.Factory}
 */
export default function tweenFactory(defaultDuration: number, defaultEasing?: EasingFunction): tweening.Factory;
/**
 * Creates a `tweening.Factory` using the provided settings.
 * @param {tweening.Settings} defaultSettings
 * @return {tweening.Factory}
 */
export default function tweenFactory(defaultSettings: Settings): tweening.Factory;
/**
 * Creates a `tweening.FactoryBuilder` using the optional settings.
 * @param {tweening.Settings} defaultSettings
 * @return {tweening.Factory}
 */
export default function tweenFactory(defaultSettings?: OptionalSettings): tweening.FactoryBuilder;
