import React, { ReactElement, useEffect } from 'react';

import { serialize, deserialize } from './serializer';

type AnyProps = Record<string, unknown>;

type Entry = {
  err?: unknown;
  result?: unknown;
  resolve?: () => void;
  promise?: Promise<void>;
};

type EmptyObject = Record<string, never>;

type WorkerState = {
  worker: Worker;
  used: Set<symbol>;
  propsMap: WeakMap<AnyProps, Entry>;
  idMap: Map<string, AnyProps>;
  i: number;
};

/**
 * Wrap an exposed component in main thread
 *
 * This will connect the component in the worker thread.
 * Requires Suspense.
 *
 * It will create a dedicated worker for each createWorker function reference.
 *
 * @example
 * import { wrap } from 'react-worker-components';
 *
 * const Foo = wrap(() => new Worker(new URL('./Foo.worker', import.meta.url)));
 */
export const wrap = <Props = EmptyObject>(
  createWorker: (() => Worker) & { state?: WorkerState },
  key?: string,
) => {
  const getWorkerState = () => {
    let { state } = createWorker;
    if (!state) {
      const worker = createWorker();
      const propsMap = new WeakMap<AnyProps, Entry>();
      const idMap = new Map<string, AnyProps>();
      worker.addEventListener('message', (e) => {
        const { id, err, ele } = e.data;
        const entry = propsMap.get(idMap.get(id) as AnyProps);
        idMap.delete(id);
        if (entry) {
          if (err) {
            entry.err = err;
          } else {
            entry.result = deserialize(ele);
          }
          entry.resolve?.();
        }
      });
      state = {
        worker,
        used: new Set(),
        propsMap,
        idMap,
        i: 0,
      };
      createWorker.state = state;
    }
    return state;
  };
  const Component: React.FC<Props> = (props) => {
    const state = getWorkerState();
    useEffect(() => {
      const id = Symbol();
      state.used.add(id);
      return () => {
        state.used.delete(id);
        if (!state.used.size && state.worker) {
          state.worker.terminate();
          delete createWorker.state;
        }
      };
    }, [state]);
    if (!state.propsMap.has(props)) {
      const entry: Entry = {};
      const promise = new Promise<void>((resolve) => {
        const id = `id${++state.i}`;
        entry.resolve = resolve;
        state.propsMap.set(props, entry);
        state.idMap.set(id, props);
        state.worker.postMessage({ key, id, props: serialize(props) });
      });
      entry.promise = promise;
      throw promise;
    }
    const entry = state.propsMap.get(props) as Entry;
    if (entry.err) throw entry.err;
    if (entry.result === undefined) throw entry.promise;
    return entry.result as ReactElement; // unsafe type assertion
  };
  return Component;
};
