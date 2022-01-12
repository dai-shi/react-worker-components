import React, { useState } from 'react';

import { register } from 'react-worker-components';

export const Counter: React.FC = () => {
  const [count, setCount] = useState(1);
  return (
    <div>
      <span>Count: {count}</span>
      <button type="button" onClick={() => setCount(count + 1)}>+1</button>
      <button type="button" onClick={() => setCount((c) => c - 1)}>-1</button>
    </div>
  );
};

register(Counter, 'Counter');
