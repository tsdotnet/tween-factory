![@tsdotnet/tween-factory: Ease it from A to B. Typed tweens for numeric properties.](https://cdn.jsdelivr.net/gh/tsdotnet/tween-factory@master/assets/banner.svg)

[![npm version](https://img.shields.io/npm/v/@tsdotnet/tween-factory.svg?style=flat-square)](https://www.npmjs.com/package/@tsdotnet/tween-factory)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/tsdotnet/tween-factory/blob/master/LICENSE)

Configure a duration and easing once, then animate numeric object properties from one value to another.

## Install

```sh
npm install @tsdotnet/tween-factory
```

## Usage

```ts
import tweenFactory from '@tsdotnet/tween-factory';

const point = { x: 0, y: 0 };
const move = tweenFactory(1000).updateOnAnimationFrame();

const active = move.tween(point, { x: 100, y: 50 }); // animates over one second
active.dispose(); // cancels it
```

Pass an easing function, or use `updateOnInterval(ms)` where there is no animation frame.

## Use it from

ESM (`import tweenFactory from '@tsdotnet/tween-factory';`) or CommonJS (`const tweenFactory = require('@tsdotnet/tween-factory').default;`).

<details><summary>In a browser, without a bundler</summary>

```html
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/disposable@2/dist/umd/disposable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/type@1/dist/umd/type.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/compare@1/dist/umd/compare.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/exceptions@1/dist/umd/exceptions.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/collection-base@2/dist/umd/collection-base.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/lazy@2/dist/umd/lazy.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/linked-node-list@1/dist/umd/linked-node-list.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/ordered-registry@1/dist/umd/ordered-registry.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/event-factory@2/dist/umd/event-factory.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/tween-factory@3/dist/umd/tween-factory.min.js"></script>
<script>
  const tweenFactory = tsdotnet.tweenFactory.default;
</script>
```

</details>

## Docs

[tsdotnet.github.io/tween-factory](https://tsdotnet.github.io/tween-factory/)
