import React, { PropsWithChildren } from 'react';

import { serialize, deserialize } from './serializer';

export const expose = <Props>(Component: React.FC<Props>) => {
  self.onmessage = async (e: MessageEvent) => {
    const { id, props } = e.data;
    if (!id || !props) {
      throw new Error('no id or props found');
    }
    const deserialized = deserialize(props) as PropsWithChildren<Props>; // unsafe type assertion
    const thunk = () => {
      try {
        const ele = Component(deserialized);
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
