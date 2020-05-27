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
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		a.complete();
		expect(state.completed, 'completed').to.be.true;
		expect(state.disposed, 'disposed').equal(1);
	});

	it('should react to manually calling dispose', async () => {
		const tweenFactory = new TweenFactory();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		a.update();
		const last = a.lastUpdate;
		a.dispose();
		expect(state.completed, 'completed').to.be.false;
		expect(state.disposed, 'disposed').equal(-1);
		tweenFactory.update();
		expect(a.lastUpdate, 'lastUpdate').equal(last);
	});

	it('should dispose via config', async () => {
		const tweenFactory = new TweenFactory();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		a.update();
		const last = a.lastUpdate;
		tween.dispose();
		expect(state.completed, 'completed').to.be.false;
		expect(state.disposed, 'disposed').equal(-1);
		tweenFactory.update();
		expect(a.lastUpdate, 'lastUpdate').equal(last);
	});

	it('should cancel via factory', async () => {
		const tweenFactory = new TweenFactory();
		const tween = initTween(tweenFactory);
		const state = initState(tween);
		const a = tween.start();
		expect(state.started, 'started').to.be.true;
		a.update();
		const last = a.lastUpdate;
		tweenFactory.cancelActive();
		expect(state.completed, 'completed').to.be.false;
		expect(state.disposed, 'disposed').equal(-1);
		tweenFactory.update();
		expect(a.lastUpdate, 'lastUpdate').equal(last);
	});
});

type EventState = {
	started: boolean;
	completed: boolean;
	disposed: number;
};

async function test (tweenFactory: TweenFactory)
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
	expect(a.timeFrame.startTime, 'startTime').to.be.greaterThan(0);
	expect(a.timeFrame.duration, 'duration').equal(100);
	expect(a.timeFrame.endTime, 'endTime').equal(a.timeFrame.startTime + 100);
	tweenFactory.update();
	expect(isNaN(a.lastUpdate), 'lastUpdate').not.to.be.true;
	expect(a.timeFrame.progress, 'progress').equal(1);
	expect(state1.completed, 'state1.completed').to.be.true;
	expect(state1.disposed, 'state1.disposed').equal(1);

	expect(state2.started, 'state2.started').to.be.true;
	await delay(110);
	tweenFactory.update();
	expect(state2.completed, 'state2.completed').to.be.true;
	expect(state2.disposed, 'state2.disposed').equal(1);
}


function initTween (tf: TweenFactory): tweening.Config
{
	return tf.duration(100).add({
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
