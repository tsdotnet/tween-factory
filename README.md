# ![alt text](https://avatars1.githubusercontent.com/u/64487547?s=30 "tsdotnet") tsdotnet / tween-factory

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/tsdotnet/tween-factory/blob/master/LICENSE)
![npm-publish](https://github.com/tsdotnet/tween-factory/workflows/npm-publish/badge.svg)
[![npm version](https://img.shields.io/npm/v/@tsdotnet/tween-factory.svg?style=flat-square)](https://www.npmjs.com/package/@tsdotnet/tween-factory)

A strongly-typed "tweening" utility for use with TypeScript and JavaScript.
 
Designed from the ground up with TypeScript in mind, `tween-factory` makes configuring and activating tweens easy and worry free.  *See examples below.*

## Docs

All entities include JS Docs and full intellisense support.

[tsdotnet.github.io/tween-factory](https://tsdotnet.github.io/tween-factory/)

### Terminology

`tween`: Anything that modifies a set of properties over time.

`property range`: The numeric ranged values of a specific property.

`active tween`: Any tween that has been activated.

`tween behavior`: Typically the configuration of duration and easing function.

`disposable`: Something that can be disposed.  (Calling `.dispose()` on an active tween will cancel it.)

### Examples

#### Importing
```typescript
import tweenFactory from '@tsdotnet/tween-factory';
```

#### Configuring a one-time tween 

```typescript
const tweenBehavior = tweenFactory(1000 /*milliseconds*/).updateOnAnimationFrame();
tweenBehavior.tween(point, {x:100, y:50}, optionalEasingFunction); 
```

or

```typescript
const tweenBehavior = tweenFactory().updateOnInterval(1);
tweenBehavior.duration(1000).tween(point, {x:100, y:50}, optionalEasingFunction); 
```

or

```typescript
const tweenBehavior = tweenFactory().updateOnAnimationFrame();
tweenBehavior.duration(1000).easing(fn).tween(point, {x:100, y:50}); 
```

#### Reusing the factory

A tween behavior can be reused as a base for other settings.

```typescript
const tweenBehavior = tweenFactory(1000, defaultEasingFunction).updateOnAnimationFrame();
tweenBehavior // point 1 and 2 will be synchronized
    .add(point1, {x:100, y:50})
    .add(point2, {x:80, y:30})
    .start();

// sometime later ...
tweenBehavior
    .duration(500)
    .tween(point3, {x:50, y:110});
```

#### Listening for events

Tweens expose events for reacting to their life-cycle.

* `.started` (only once) when the tween has been activated.
* `.updated` for every update signal a tween has processed.
* `.completed` (only once) when an update has signaled the tween has reached its end or the `.complete()` method has been called.
* `.disposed` (only once) after completion or the `.dispose()` method was called.

```typescript
tweenBehavior
    .duration(500)
    .tween(point3, {x:50, y:110})
    .events.completed(()=> /* do something */);
```

or

```typescript
await tweenBehavior
    .duration(500)
    .tween(point3, {x:50, y:110})
    .events.completed.once();
```

For more details about the event API: [tsdotnet / event-factory](https://github.com/tsdotnet/event-factory)

#### Overriding / interrupting

New tweens will always override any active property ranges.

This policy is to prevent any unexpected 'fight' between two tweens.  
The later is always the winner.

The following will *hi-jack* the `x` property of `point2` but the `y` property will still continue as originally configured.

```typescript
const tweenBehavior = tweenFactory(1000, defaultEasingFunction).updateOnAnimationFrame();
tweenBehavior // point 1 and 2 will be synchronized
    .add(point1, {x:100, y:50})
    .add(point2, {x:80, y:30})
    .start();

tweenBehavior
    .duration(500)
    .tween(point2, {x:50});
```

## Possible Future

* Modifying non-number values like `100px`.
* Simple tween chaining is currently supported, but a more appropriate 'sequence' API may be required.
* Looping.

