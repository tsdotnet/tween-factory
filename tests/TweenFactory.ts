/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import {expect} from 'chai';
import back from '../src/easing/back';
import TweenFactory, {tweening} from '../src/TweenFactory';

describe('TweenFactory', () => {

	describe('default easing', async () => {
		it('should emit all events and progress', async () => {
			await test(new TweenFactory());
		});
	});

	describe('custom easing', async () => {
		it('should emit all events and progress', async () => {
			await test(new TweenFactory(back.easeIn));
		});
	});

	it('should react to manually calling complete', async () => {
		const tweenFactory = new TweenFactory();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		let disposedResult = -1;
		tween.events.started(() => state.started = true);
		tween.events.completed(() => state.completed = true);
		tween.events.disposed(result => {
			state.disposed = true;
			disposedResult = result ? 1 : 0;
		});
		const a = tween.start();
		expect(state.started).to.be.true;
		a.complete();
		expect(state.completed).to.be.true;
		expect(state.disposed).to.be.true;
		expect(disposedResult).equal(1);
	});

	it('should react to manually calling dispose', async () => {
		const tweenFactory = new TweenFactory();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		let disposedResult = -1;
		tween.events.started(() => state.started = true);
		tween.events.completed(() => state.completed = true);
		tween.events.disposed(result => {
			state.disposed = true;
			disposedResult = result ? 1 : 0;
		});
		const a = tween.start();
		expect(state.started).to.be.true;
		a.dispose();
		expect(state.completed).to.be.false;
		expect(state.disposed).to.be.true;
		expect(disposedResult).equal(0);
	});
});

type EventState = {
	started: boolean;
	completed: boolean;
	disposed: boolean;
};

async function test (tweenFactory: TweenFactory)
{
	const point1 = {x: 0, y: 0}, point2 = {x: 0, y: 0};
	const tween1 = tweenFactory.behavior(100).add(point1, {x: 10, y: 8});
	const state1 = initState(tween1);
	const tween2 = tween1.chain().add(point2, {x: 10});
	const state2 = initState(tween2);

	const a = tween1.start();

	expect(state1.started, 'state1.started').to.be.true;
	await delay(10);
	expect(a.progress).not.equal(0);
	await delay(100);
	tweenFactory.update();
	expect(a.progress, 'progress').equal(1);
	expect(state1.completed, 'state1.completed').to.be.true;
	expect(state1.disposed, 'state1.disposed').to.be.true;

	expect(state2.started, 'state2.started').to.be.true;
	await delay(110);
	tweenFactory.update();
	expect(state2.completed, 'state2.completed').to.be.true;
	expect(state2.disposed, 'state2.disposed').to.be.true;
}


function initTween (tf: TweenFactory): tweening.Config
{
	return tf.behavior(100).add({
		x: 0,
		y: 0
	}, {
		x: 10,
		y: 8
	});
}

function initState (t: tweening.Config): EventState
{
	const state = {
		started: false,
		completed: false,
		disposed: false
	};
	t.events.started(() => state.started = true);
	t.events.completed(() => state.completed = true);
	t.events.disposed(() => state.disposed = true);
	return state;
}

function delay (ms: number)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}
