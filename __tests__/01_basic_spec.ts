import { register, expose, wrap } from '../src/index';

describe('basic spec', () => {
  it('exported function', () => {
    expect(register).toBeDefined();
    expect(expose).toBeDefined();
    expect(wrap).toBeDefined();
  });
});
