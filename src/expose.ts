import React, { PropsWithChildren } from 'react';

import { isComponentRegistered } from './register';
import { serialize, deserialize } from './serializer';

// TODO cache render result

const render = <Props>(Component: React.FC<Props>, props: Props) => {
  const ele = Component(props);
  return walk(ele);
};

const eleTypeof = '$$typeof';
const eleSymbol = Symbol.for('react.element');

const walk = <T>(x: T): T => {
  if (typeof x !== 'object' || x === null) return x;
  const obj = x as unknown as Record<string, unknown>;
  if (obj[eleTypeof] === eleSymbol) {
    const { type } = obj;
    if (typeof type !== 'string' && !isComponentRegistered(type)) {
      return render(
        type as React.FC<unknown>,
        obj.props,
      ) as unknown as T;
    }
  }
  if (typeof obj.props !== 'object' || obj.props === null) return x;
  const { children } = obj.props as Record<string, unknown>;
  if (Array.isArray(children)) {
    const newChildren: typeof children = children.map(walk);
    if (newChildren.every((child, index) => child === children[index])) {
      return x;
    }
    return { ...x, props: { ...obj.props, children: newChildren } };
  }
  const newChildren: typeof children = walk(children);
  if (newChildren === children) {
    return x;
  }
  return { ...x, props: { ...obj.props, children: newChildren } };
};

export const expose = <Props>(Component: React.FC<Props>) => {
  self.onmessage = async (e: MessageEvent) => {
    const { id, props } = e.data;
    if (!id || !props) {
      throw new Error('no id or props found');
    }
    const deserialized = deserialize(props) as PropsWithChildren<Props>; // unsafe type assertion
    const thunk = () => {
      try {
        const ele = render(Component, deserialized);
        (self as unknown as Worker).postMessage({ id, ele: serialize(ele) });
      } catch (err) {
        if (err instanceof Promise) {
          err.then(thunk);
        } else {
          (self as unknown as Worker).postMessage({ id, err });
        }
      }
    };
    thunk();
  };
};
