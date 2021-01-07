import { ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

const component2name = new Map<AnyComponent, string>();
const name2component = new Map<string, AnyComponent>();

/**
 * Register a component with a string name
 *
 * This allows serializing components between main and worker threads.
 *
 * @example
 * import { register } from 'react-worker-components';
 *
 * const Counter = () => {
 *   const [count, setCount] = useState(0);
 *   return <div>{count}<button onClick={() => setCount(1)}>1</button></div>;
 * };
 *
 * register(Counter, 'Counter');
 */
export const register = (
  component: AnyComponent,
  name: string,
) => {
  component2name.set(component, name);
  name2component.set(name, component);
};

export const isComponentRegistered = (
  component: unknown,
) => component2name.has(component as AnyComponent);

export const getName = (
  component: AnyComponent,
) => {
  const name = component2name.get(component);
  if (!name) throw new Error(`component ${component} is not registered`);
  return name;
};

export const getComponent = (
  name: string,
) => {
  const component = name2component.get(name);
  if (!component) throw new Error(`component name ${name} is not registered`);
  return component;
};
