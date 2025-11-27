import React from 'react';
import { AppRegistry } from './native-shim';
import App from './App';

const rootTag = document.getElementById('root');
if (!rootTag) {
  throw new Error('Root element not found');
}

AppRegistry.registerComponent('main', () => App);
AppRegistry.runApplication('main', {
  initialProps: {},
  rootTag,
});
