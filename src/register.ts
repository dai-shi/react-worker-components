import { ComponentType } from 'react';

const component2name = new Map<ComponentType, string>();
const name2component = new Map<string, ComponentType>();

export const register = (
  component: ComponentType,
  name: string,
) => {
  component2name.set(component, name);
  name2component.set(name, component);
};

export const getName = (
  component: ComponentType,
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
