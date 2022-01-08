import React, { Suspense, useState } from 'react';

import { wrap } from 'react-worker-components';

import { TextBox } from './TextBox';

import { Props as HelloProps } from './Hello.worker';

const Hello = wrap<HelloProps>(() => new Worker(new URL('./Hello.worker', import.meta.url)));

const Counter: React.FC = () => {
  const [count, setCount] = useState(1);
  return (
    <div>
      <span>Count: {count}</span>
      <button type="button" onClick={() => setCount(count + 1)}>+1</button>
      <button type="button" onClick={() => setCount((c) => c - 1)}>-1</button>
      <Suspense fallback="Loading...">
        <Hello count={count}>
          <TextBox />
        </Hello>
      </Suspense>
    </div>
  );
};

export default Counter;
