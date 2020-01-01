import { tap, map, reduce } from "rxjs/operators";
import { TraverseContext } from '../index';

export const value = <T>() =>
  map((cx: TraverseContext<T>) => cx.state?.value);

export const cancelWhen = <T>(fn: (cx: TraverseContext<T>) => boolean) =>
  tap((cx: TraverseContext<T>) => fn(cx) && cx.cancel());

export const skipWhen = <T>(fn: (cx: TraverseContext<T>) => boolean) =>
  tap((cx: TraverseContext<T>) => fn(cx) && cx.skip());

export const toObject = <T extends object>() =>
  reduce((obj: T, cx: TraverseContext<T>) => {
    if (cx.state.path.length === 0) {
      return cx.state.value;
    } else if (cx.state.path.length === 1) {
      return Object.assign(obj, { [cx.state.path[0]]: cx.state.value });
    } else {
      const last = cx.state.path[cx.state.path.length - 1];
      const path = cx.state.path.slice(0, cx.state.path.length - 1);
      const lens = path.reduce((prev: any, curr: string) => {
        return prev[curr] ?? {}
      }, obj);
      Object.assign(lens, { [last]: cx.state.value });
      return obj;
    }
  }, {} as T);