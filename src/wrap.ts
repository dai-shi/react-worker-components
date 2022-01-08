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

/**
 * Wrap an exposed component in main thread
 *
 * This will connect the component in the worker thread.
 * Requires Suspense.
 *
 * @example
 * import { wrap } from 'react-worker-components';
 *
 * const Foo = wrap(() => new Worker(new URL('./Foo.worker', import.meta.url)));
 */
export const wrap = <Props = EmptyObject>(createWorker: () => Worker) => {
  let worker: Worker | undefined;
  const used = new Set<symbol>();
  const propsMap = new WeakMap<AnyProps, Entry>();
  const idMap = new Map<string, AnyProps>();
  let idIndex = 0;
  const Component: React.FC<Props> = (props) => {
    if (!worker) {
      worker = createWorker();
      worker.onmessage = (e: MessageEvent) => {
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
      };
    }
    useEffect(() => {
      const id = Symbol();
      used.add(id);
      return () => {
        used.delete(id);
        if (!used.size && worker) {
          worker.terminate();
          worker = undefined;
        }
      };
    }, []);
    if (!propsMap.has(props)) {
      const entry: Entry = {};
      const promise = new Promise<void>((resolve) => {
        const id = `id${++idIndex}`;
        entry.resolve = resolve;
        propsMap.set(props, entry);
        idMap.set(id, props);
        worker?.postMessage({ id, props: serialize(props) });
      });
      entry.promise = promise;
      throw promise;
    }
    const entry = propsMap.get(props) as Entry;
    if (entry.err) throw entry.err;
    if (entry.result === undefined) throw entry.promise;
    return entry.result as ReactElement; // unsafe type assertion
  };
  return Component;
};
