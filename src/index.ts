import { Observable, Subscriber } from 'rxjs';

const isObject = (obj: any): obj is object =>
  obj !== null
  && typeof obj === 'object'
  && !(obj instanceof String);

const isCircular = <T>(obj: T, parents: T[]) =>
  isObject(obj) && !Array.isArray(obj) && parents.indexOf(obj) !== -1;

const defaultDriver = <T = any>(obj: T): Iterable<[string, T]> => isObject(obj) ? Object.entries(obj) : [];

export type TraverseDriver<T = any> = (obj: T) => Iterable<[string | string[], T]>;

export class TraverseState<T = any> {
  constructor(
    readonly value: T,
    readonly path: string[],
    readonly parents: T[],
    readonly circular: boolean) {
  }

  get depth() {
    return this.path.length;
  }

  get key() {
    return this.path[this.path.length - 1];
  }
}

export class TraverseContext<T = any> {
  constructor(
    readonly state: TraverseState<T>,
    readonly skip: () => void,
    readonly cancel: () => void,
  ) { }

  get value() {
    return this.state.value;
  }

  setState(state: TraverseState<T>) {
    return new TraverseContext(state, this.skip, this.cancel);
  }

  setValue(value: T) {
    return this.setState(new TraverseState(
      value, 
      this.state.path,
      this.state.parents,
      isCircular(value, this.state.parents)));
  }
}

function* _traverse<T>(
  current: T,
  driver: TraverseDriver<T>,
  path: string[] = [],
  parents: T[] = [],
): Generator<TraverseState<T>> {
  const [value, circular] = isCircular(current, parents)
    ? ['[Circular]' as any, true]
    : [current, false];

  const skip = yield new TraverseState(value, path, parents, circular);

  if (skip || circular) {
    return;
  }

  const entries = driver(current) || [];
  const childrenParents = parents.concat(current);
  for (const [key, v] of entries) {
    yield* _traverse(v, driver, path.concat(key), childrenParents);
  }
}

const subscriberFn = <T>(object: T, driver: TraverseDriver<T>) => (subscriber: Subscriber<TraverseContext<T>>) => {
  const iterator = _traverse(object, driver);

  let skip = false;
  let canceled = false;
  let result = iterator.next();
  const teardown = () => { canceled = true };
  const context = new TraverseContext<T>(
    result.value,
    () => { skip = true },
    teardown,
  );

  while (!result.done && !subscriber.closed && !canceled) {
    subscriber.next(context.setState(result.value));
    result = iterator.next(skip);
    skip = false;
  }

  subscriber.complete();

  return teardown;
};

export function traverse<T = any>(object: T, driver: TraverseDriver<T> = defaultDriver) {
  return new Observable<TraverseContext<T>>(subscriberFn(object, driver));
}
