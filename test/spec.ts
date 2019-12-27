import { traverse } from '../src/index';
import { map, skip, tap, toArray } from 'rxjs/operators';

describe('rx-traverse', () => {
  it('should traverse an array', done => {
    traverse([1, 2, 3])
      .pipe(
        skip(1),
        map(x => x.state.value),
        toArray())
      .subscribe(
        arr => expect(arr).toEqual([1, 2, 3]),
        done,
        done);
  });

  it('should allow custom traverse logic', () => {
    type NodeLike = { id: number, children?: NodeLike[] };

    const tree: NodeLike = {
      id: 1, children: [
        { id: 2 },
      ]
    };

    return expect(
      traverse<NodeLike>(tree, n => Object.entries(n.children || [])
        .map(([k, v]) => [['children', k], v]))
        .pipe(map(x => x.state.value))
        .toPromise()
    ).resolves.toEqual({ id: 2 });
  });

  it('should handle a circular reference', () => {
    const tree = { id: 1, children: [] as any[] };
    tree.children.push(tree);

    return expect(
      traverse(tree)
        .pipe(map(x => x.state.value))
        .toPromise()
    ).resolves.toEqual('[Circular]');
  });

  it('should stop', done => {
    traverse<number[] | number>([1, 2, 3])
      .pipe(
        tap(x => (x.state.value === 2) && x.cancel()),
        skip(1),
        map(x => x.state.value),
        toArray())
      .subscribe(
        arr => expect(arr).toEqual([1, 2]),
        done,
        done);
  });

  it('should skip', done => {
    traverse<any>([1, 2, [3, 4], 5])
      .pipe(
        tap(x => (x.state.depth === 1 && Array.isArray(x.state.value)) && x.skip()),
        skip(1),
        map(x => x.state.value),
        toArray())
      .subscribe(
        arr => expect(arr).toEqual([1, 2, [3, 4], 5]),
        done,
        done);
  });
});
