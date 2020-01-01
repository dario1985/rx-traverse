import { skip, toArray, map } from 'rxjs/operators';

import { traverse, TraverseContext } from '../src/index';
import { value, cancelWhen, skipWhen, toObject } from '../src/operators/index';

describe('rx-traverse/operators', () => {
  describe('value', () => {
    it('should extract values for each traverse context', () =>
      expect(traverse([1, 2, 3])
        .pipe(
          skip(1),
          value(),
          toArray()).toPromise()).resolves.toEqual([1, 2, 3]))
  });

  describe('cancelWhen', () => {
    it('should cancel traverse on condition', () =>
      expect(traverse<number[] | number>([1, 2, 3])
        .pipe(
          cancelWhen(cx => cx.value === 2),
          value(),
        )
        .toPromise()).resolves.toBe(2)
    )
  });

  describe('skipWhen', () => {
    it('should skip traverse on condition', () =>
      expect(traverse<Array<number[] | number>>([1, 2, [4, 5], 3])
        .pipe(
          skip(1),
          skipWhen(cx => cx.state.depth > 0 && Array.isArray(cx.state.value)),
          value(),
          toArray(),
        )
        .toPromise()).resolves.toEqual([1, 2, [4, 5], 3])
    )
  });

  describe('toObject', () => {
    type MyObject = Record<string, any>;
    it('should generate a new object values for each traverse context', () =>
      expect(traverse<MyObject | number>({ a: { b: { c: 1 } } })
        .pipe(
          map((cx: TraverseContext) => cx.state.key === 'c' ? cx.setValue(2) : cx),
          toObject()
        )
        .toPromise()).resolves.toEqual({ a: { b: { c: 2 } } })
    )
  });
});
