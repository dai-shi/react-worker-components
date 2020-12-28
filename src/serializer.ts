import {
  ComponentType,
  ReactNode,
  createElement as createElementOrig,
} from 'react';

import { getName, getComponent } from './register';

const createElement = (
  type: Parameters<typeof createElementOrig>[0],
  { children, ...props }: Record<string, unknown>,
) => {
  if (Array.isArray(children)) {
    return createElementOrig(type, props, ...children as ReactNode[]);
  }
  if (children) {
    return createElementOrig(type, props, children as ReactNode);
  }
  return createElementOrig(type, props);
};

// FIXME these maps need garbege collection... how???

const idx2obj = new Map<number, unknown>();
const obj2idx = new Map<unknown, number>();

const idx2arr = new Map<number, unknown>();
const arr2idx = new Map<unknown, number>();

const idx2ele = new Map<number, unknown>();
const ele2idx = new Map<unknown, number>();

const eleTypeof = '$$typeof';
const eleSymbol = Symbol.for('react.element');

const isWorker = !self.document;
let index = 0;
const nextIndex = isWorker ? (() => ++index) : (() => --index);

type Serialized =
  | { v: unknown }
  | { i: number } & (
    | { e: { props: Serialized; type: string | { c: string } } }
    | { a: Serialized[] }
    | { o: Record<string, Serialized> }
  );

const isSerialized = (x: unknown): x is Serialized => {
  if (typeof process === 'object' && process.env.NODE_ENV !== 'production') {
    if (typeof x !== 'object' || x === null) return false;
    if ('v' in x) return true;
    if (typeof (x as { i: unknown }).i !== 'number') return false;
    if ('e' in x) {
      const { e } = x as { e: unknown };
      if (typeof e !== 'object' || e === null) return false;
      if (!isSerialized((e as { props: unknown }).props)) return false;
      const { type } = e as { type: unknown };
      if (typeof type === 'string') return true;
      if (typeof type !== 'object' || type === null) return false;
      return typeof (type as { c: unknown }).c === 'string';
    }
    if ('a' in x) {
      const { a } = x as { a: unknown };
      return Array.isArray(a) && a.every(isSerialized);
    }
    if ('o' in x) {
      const { o } = x as { o: unknown };
      if (typeof o !== 'object' || o === null) return false;
      return Object.values(o).every(isSerialized);
    }
    return false;
  }
  return true;
};

export const serialize = (x: unknown): Serialized => {
  if (typeof x !== 'object' || x === null) {
    return { v: x };
  }
  if ((x as { [eleTypeof]: unknown })[eleTypeof] === eleSymbol) {
    const e = {
      props: serialize((x as { props: unknown }).props),
      type: typeof (x as { type: unknown }).type === 'string'
        ? (x as { type: string }).type
        : { c: getName((x as { type: ComponentType }).type) },
    };
    let i: number;
    if (ele2idx.has(x)) {
      i = ele2idx.get(x) as number;
    } else {
      i = nextIndex();
      ele2idx.set(x, i);
      idx2ele.set(i, x);
    }
    return { i, e };
  }
  if (Array.isArray(x)) {
    const a = x.map(serialize);
    let i: number;
    if (arr2idx.has(x)) {
      i = arr2idx.get(x) as number;
    } else {
      i = nextIndex();
      arr2idx.set(x, i);
      idx2arr.set(i, x);
    }
    return { i, a };
  }
  // typeof x === 'object'
  const o: Record<string, Serialized> = {};
  Object.entries(x).forEach(([key, val]) => {
    if (typeof key === 'symbol') throw new Error('symbol keys are not supported');
    o[key] = serialize(val);
  });
  let i: number;
  if (obj2idx.has(x)) {
    i = obj2idx.get(x) as number;
  } else {
    i = nextIndex();
    obj2idx.set(x, i);
    idx2obj.set(i, x);
  }
  return { i, o };
};

export const deserialize = (x: unknown): unknown => {
  if (!isSerialized(x)) throw new Error('not serialized type');
  if ('v' in x) return x.v;
  if ('e' in x) {
    if (idx2ele.has(x.i)) {
      return idx2ele.get(x.i);
    }
    const type = typeof x.e.type === 'string'
      ? x.e.type
      : getComponent(x.e.type.c);
    const ele: unknown = createElement(type, deserialize(x.e.props) as Record<string, unknown>);
    idx2ele.set(x.i, ele);
    return ele;
  }
  if ('a' in x) {
    if (idx2arr.has(x.i)) {
      return idx2arr.get(x.i);
    }
    const arr = x.a.map(deserialize);
    idx2arr.set(x.i, arr);
    return arr;
  }
  if ('o' in x) {
    if (idx2obj.has(x.i)) {
      return idx2obj.get(x.i);
    }
    const obj: Record<string, unknown> = {};
    Object.entries(x.o).forEach(([key, val]) => {
      obj[key] = deserialize(val);
    });
    idx2obj.set(x.i, obj);
    return obj;
  }
  throw new Error('should not reach here');
};
