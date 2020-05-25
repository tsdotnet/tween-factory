/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import {expect} from 'chai';
import PropertyRange from '../src/PropertyRange';

/* eslint-disable @typescript-eslint/ban-ts-comment */

describe('PropertyRange', () => {

	it('should throw for invalid parameters', () => {
		expect(() => {
			// @ts-expect-error;
			new PropertyRange(null, null);
		}).to.throw();
		expect(() => {
			// @ts-expect-error;
			new PropertyRange({}, null);
		}).to.throw();

		expect(() => {
			// @ts-expect-error;
			new PropertyRange({x: 0, y: 0}, {x: 'hello'});
		}).to.throw();

		expect(() => {
			const a = {x: 0, y: 0} as any;
			const pr = new PropertyRange(a, {x: 10});
			a.x = 'hello';
			pr.init();
		}).to.throw();
	});

	it('should change values to expected', () => {
		const point = {
			x: 0,
			y: 0
		};
		const pr = new PropertyRange(point, {x: 10, y: 8});
		expect(point.x).equal(0);
		expect(point.y).equal(0);
		expect(() => pr.update(1)).to.throw();
		pr.init();
		expect(point.x).equal(0);
		expect(point.y).equal(0);
		pr.update(0.5);
		expect(point.x).equal(5);
		expect(point.y).equal(4);
		pr.update(0.75);
		expect(point.x).equal(7.5);
		expect(point.y).equal(6);
		pr.dispose();
		expect(point.x).equal(7.5);
		expect(point.y).equal(6);
		pr.init();
		pr.update(1);
		expect(point.x).equal(7.5);
		expect(point.y).equal(6);
	});

});
