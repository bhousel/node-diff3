import { test } from 'tap';
import * as Diff3 from '../index.mjs';

test('skip', t => t.end());

export function testTimeout(t, func) {
  t.test('with timeout', t => {
    let originalDateNow;
    t.before(() => { originalDateNow = Date.now; });
    t.afterEach(() => { Date.now = originalDateNow; });
  
    const timeout = 1000;

    t.test('should throw', t => {
      let time = 0;
      Date.now = () =>  {
        const res = time;
        time += timeout + 1;
        return res;
      };
      t.throws(() => func(timeout), new Diff3.TimeoutError());
      t.end();
    });
  
    t.test('should not throw', t => {
      Date.now = () =>  0;
      t.doesNotThrow(() => func(timeout));
      t.end();
    });
  
    t.end();
  });
}
