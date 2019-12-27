import ntraverse from 'traverse';
import { Observable } from 'rxjs';
import { traverse } from '../src/index';
const blocked = require('blocked-at');

const wait = (ms: number) => new Promise(fn => setTimeout(fn, ms));
const heapUsed = () => Math.round(process.memoryUsage().heapUsed / 1024);

blocked((time: number, stack: string) => {
  console.log(`Blocked for ${time}ms, operation started here:`, stack);
}, { threshold: 20, interval: 100 });

const buildTree = () => {
  const max = 1000;
  const tree = { id: '0', children: [] as any[] };
  for (let i = 0; i < max; i++) {
    tree.children.push({ id: `${i}`, children: [] });
  }
  for (let i = 0; i < (max / 2); i++) {
    const evenNode = tree.children[i * 2];
    [1, 2, 3, 4, 5].forEach(
      k => evenNode.children.push({ id: `${i * 2}:${k}`, children: [] })
    );
    evenNode.children[0].children.push(evenNode)

    const oddNode = tree.children[i * 2 + 1];
    [1, 2, 3, 4, 5].reduce((node, k) =>
      node.children[0] = { id: `${i * 2 + 1}:${k}`, children: [] },
      oddNode);
  }
  return tree;
}

const testTraverseRx = async (tree: any) => {
  const observer = traverse(tree);
  return observer.toPromise()
}

const testTraverse = async (tree: any) => {
  return new Observable(subscriber => {
    ntraverse(tree).forEach((x: any) => subscriber.next(x));
    subscriber.complete();
  }).toPromise();
}

const testRunner = async (description: string, times: number, fn: () => Promise<void>) => {
  const startHeap = heapUsed();
  console.log(startHeap + 'M', description, 'in 5s...');
  await wait(5000);
  const hrstart = process.hrtime();
  for (let i = 0; i < times; i++) {
    await fn();
  }
  const hrdiff = process.hrtime(hrstart);
  console.log(heapUsed() + 'M - Execution time: ', Math.round(hrdiff[0] * 1e3 + hrdiff[1] / 1e6));
  console.log('--- Wait 5s for GC...');
  await wait(5000);
  const endHeap = heapUsed();
  console.log(endHeap + 'M.', 'difference:', (endHeap - startHeap) + 'M');
}

async function main(): Promise<void> {
  const times = 1000;
  const tree = buildTree();
  console.log(tree, heapUsed() + 'M');

  await testRunner('Test traverse-rx', times, async () => {
    await testTraverseRx(tree)
  });

  await testRunner('Test traverse', times, async () => {
    await testTraverse(tree)
  });

  console.log(heapUsed() + 'M - End test in 5s...')
  await wait(5000);
}

main();