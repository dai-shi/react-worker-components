import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

const ele = document.getElementById('app');
if (!ele) throw new Error('no app');
ReactDOM.render(React.createElement(App), ele);
