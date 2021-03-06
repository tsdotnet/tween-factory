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
			new PropertyRange({x: 0, y: 0}, {x: NaN});
		}).not.to.throw();

		expect(() => {
			const a = {x: 0, y: 0} as any;
			const pr = new PropertyRange(a, {x: 10});
			a.x = 'hello';
			pr.init();
		}).to.throw();
	});

	it('should throw if updated before init', () => {

		const r = new PropertyRange({x: 0, y: 0}, {x: 10});
		expect(() => {
			r.update(0.5);
		}).to.throw();
	});

	it('should init requested values', () => {
		const point = {
			x: 0,
			y: 0
		};
		const pr = new PropertyRange(point, {x: 10, y: 8});
		expect(point.x).equal(0);
		expect(point.y).equal(0);
		expect(() => pr.update(1)).to.throw();
		expect(pr.init({x: 1})).equal(2);
		expect(point.x).equal(0);
		pr.update(0);
		expect(point.x).equal(1);
	});

	it('init should property count ranged values', () => {
		const point = {
			x: 0,
			y: 0
		};
		{
			const pr = new PropertyRange(point, {x: 10, y: 0});
			expect(pr.init()).equal(1);
		}
		{
			const pr = new PropertyRange(point, {x: 10});
			expect(pr.init()).equal(1);
		}
		{
			const pr = new PropertyRange(point, {x: 0});
			expect(pr.init()).equal(0);
		}
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
		expect(() => pr.init()).to.throw();
		expect(() => pr.update(1)).to.throw();
		expect(point.x).equal(7.5);
		expect(point.y).equal(6);
	});

	it('should hijack ownership', () => {
		const point = {
			x: 0,
			y: 0
		};
		const pr1 = new PropertyRange(point, {x: 10, y: 8});
		const pr2 = new PropertyRange(point, {x: -10, y: -8});
		pr1.init();
		pr1.update(1);
		expect(point.x).equal(10);
		expect(point.y).equal(8);
		pr2.init({x: 0});
		pr2.update(1);
		expect(point.x).equal(-10);
		expect(point.y).equal(-8);
		pr1.update(2);
		expect(point.x).equal(-10);
		expect(point.y).equal(-8);
		pr2.update(2);
		expect(point.x).equal(-20);
		expect(point.y).equal(-24);
	});

});
