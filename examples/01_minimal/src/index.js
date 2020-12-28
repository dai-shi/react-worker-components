import React, { Suspense, useState } from 'react';
import ReactDOM from 'react-dom';

import { wrap } from 'react-worker-components';

import { TextBox } from './TextBox';

const Hello = wrap(() => new Worker('./Hello.worker', { type: 'module' }));

const App = () => {
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

ReactDOM.render(<App />, document.getElementById('app'));
