/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import {expect} from 'chai';
import back from '../src/easing/back';
import tweener from '../src/TweenFactory';
import tweening from '../src/Tweening';

/* eslint-disable @typescript-eslint/ban-ts-comment */

describe('TweenFactory', () => {

	it('shouldn\'t throw for valid configurations', () => {
		expect(() => {
			const tweenFactory = tweener();
			try
			{ tweenFactory.updateOnAnimationFrame(); }
			catch(ex)
				// eslint-disable-next-line no-empty
			{ }
			tweenFactory.updateOnInterval(1);
			tweenFactory.clearInterval();

			const point1 = {x: 0, y: 0};
			tweenFactory
				.duration(10)
				.tween(point1, {x: 10});

			//@ts-expect-error;
			tweenFactory.add;

			//@ts-expect-error;
			tweenFactory.tween;

			const point2 = {x: 0, y: 0};
			tweenFactory
				.duration(10)
				.add(point2, {x: 10})
				.add(point2, {y: 20}, back.easeInOut);

			tweenFactory.dispose();

		}).not.to.throw();

		expect(() => {
			const tweenFactory = tweener({duration: 10});

			const point1 = {x: 0, y: 0};
			tweenFactory.tween(point1, {x: 10});

			const point2 = {x: 0, y: 0};
			tweenFactory
				.add(point2, {x: 10})
				.add(point2, {y: 20}, back.easeInOut);
		}).not.to.throw();

		expect(() => {
			const tweenFactory = tweener(10, back.easeOut);

			const point1 = {x: 0, y: 0};
			tweenFactory.tween(point1, {x: 10});

			const point2 = {x: 0, y: 0};
			tweenFactory
				.add(point2, {x: 10})
				.add(point2, {y: 20}, back.easeInOut);
		}).not.to.throw();

		expect(() => {
			tweener({delay: NaN} as any);
		}).not.to.throw();
	});

	it('should throw for invalid configurations', () => {
		expect(() => {
			tweener('hello' as any);
		}, 'settings be valid').to.throw();
		expect(() => {
			tweener({easing: 'hello'} as any);
		}, 'settings.easing should be a function').to.throw();
		expect(() => {
			tweener({easing: () => 'hello'} as any);
		}, 'settings.easing function should return a number').to.throw();
		expect(() => {
			tweener({duration: 'hello'} as any);
		}, 'settings.duration should be a number').to.throw();
		expect(() => {
			tweener(NaN);
		}, 'duration cannot be NaN').to.throw();
		expect(() => {
			tweener({duration: NaN} as any);
		}, 'settings.duration cannot be NaN').to.throw();
		expect(() => {
			tweener(-1);
		}, 'duration should be a positive value').to.throw();
		expect(() => {
			tweener({duration: -1} as any);
		}, 'settings.duration should be a positive value').to.throw();
		expect(() => {
			tweener(Infinity);
		}, 'duration must be a finite value').to.throw();
		expect(() => {
			tweener({duration: Infinity} as any);
		}, 'settings.duration must be a finite value').to.throw();

	});

	describe('default easing', async () => {
		it('should emit all events and progress', async () => {
			await test(tweener());
		});
	});

	describe('custom easing', async () => {
		it('should emit all events and progress', async () => {
			await test(tweener(back.easeIn));
		});
	});

	it('should react to manually calling complete', () => {
		const tweenFactory = tweener();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		a.complete();
		expect(state.completed, 'completed').to.be.true;
		expect(state.disposed, 'disposed').equal(1);
		expect(() => a.dispose()).not.to.throw();
	});

	it('should await completed', async () => {
		const tweenFactory = tweener();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		const promise = a.events.completed.once();
		a.complete();
		await promise;
	});

	it('should react to manually calling dispose', () => {
		const tweenFactory = tweener();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		a.update();
		const last = a.lastUpdate;
		a.dispose();
		expect(state.completed, 'completed').to.be.false;
		expect(state.disposed, 'disposed').equal(-1);
		tweenFactory.active.update();
		expect(a.lastUpdate, 'lastUpdate').equal(last);
	});

	it('should dispose via config', () => {
		const tweenFactory = tweener();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		a.update();
		const last = a.lastUpdate;
		tween.dispose();
		expect(state.completed, 'completed').to.be.false;
		expect(state.disposed, 'disposed').equal(-1);
		tweenFactory.active.update();
		expect(a.lastUpdate, 'lastUpdate').equal(last);
	});

	it('should cancel via factory', () => {
		const tweenFactory = tweener();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		a.update();
		const last = a.lastUpdate;
		tweenFactory.active.cancel();
		expect(state.completed, 'completed').to.be.false;
		expect(state.disposed, 'disposed').equal(-1);
		tweenFactory.active.update();
		expect(a.lastUpdate, 'lastUpdate').equal(last);
	});

	describe('.tweenDeltas', () => {
		const config = tweener().duration(100);
		it('should tween changes', () => {
			expect(config.tweenDeltas({
				x: 0,
				y: 0
			}, {
				x: 10,
				y: 8
			})).not.to.be.undefined;
		});
		it('should not tween unchanged', () => {
			expect(config.tweenDeltas({
				x: 0,
				y: 0
			}, {
				x: 0,
				y: 0
			})).to.be.undefined;
			expect(config.tweenDeltas({
				x: 1,
				y: 0
			}, {
				x: 1
			})).to.be.undefined;
		});
	});

});

type EventState = {
	started: boolean;
	completed: boolean;
	disposed: number;
};

async function test (tweenFactory: tweening.FactoryBuilder)
{
	const point1 = {x: 0, y: 0}, point2 = {x: 0, y: 0};
	const tween1 = tweenFactory.duration(100).add(point1, {x: 10, y: 8});
	const state1 = initState(tween1);
	const tween2 = tween1.chain().add(point2, {x: 10});
	const state2 = initState(tween2);

	const a = tween1.start();
	expect(() => { tween1.add({x: 0}, {x: 10}); }).to.throw();
	expect(() => { tween1.chain(); }).to.throw();
	expect(state1.started, 'state1.started').to.be.true;
	expect(isNaN(a.lastUpdate)).to.be.true;
	await delay(10);
	expect(a.timeFrame.progress).not.equal(0);
	await delay(100);
	expect(isNaN(a.lastUpdate)).to.be.true;
	expect(a.timeFrame.range.start, 'timeFrame.range.start').to.be.greaterThan(0);
	expect(a.timeFrame.range.delta, 'timeFrame.range.delta').equal(100);
	expect(a.timeFrame.range.end, 'timeFrame.range.end').equal(a.timeFrame.range.start + 100);
	tweenFactory.active.update();
	expect(isNaN(a.lastUpdate), 'lastUpdate').not.to.be.true;
	expect(a.timeFrame.progress, 'progress').equal(1);
	expect(state1.completed, 'state1.completed').to.be.true;
	expect(state1.disposed, 'state1.disposed').equal(1);

	expect(state2.started, 'state2.started').to.be.true;
	await delay(110);
	tweenFactory.active.update();
	expect(state2.completed, 'state2.completed').to.be.true;
	expect(state2.disposed, 'state2.disposed').equal(1);
}


function initTween (tf: tweening.FactoryBuilder): tweening.Tween
{
	return tf.duration(100).add({
		x: 0,
		y: 0
	}, {
		x: 10,
		y: 8
	});
}

function initState (t: tweening.Tween): EventState
{
	const state = {
		started: false,
		completed: false,
		disposed: 0
	};
	t.events.started(() => state.started = true);
	t.events.completed(() => state.completed = true);
	t.events.disposed(result => { state.disposed = result ? 1 : -1; });
	return state;
}

function delay (ms: number)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}
