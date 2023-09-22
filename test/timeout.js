import { test } from 'tap';
import * as Diff3 from '../index.mjs';

test('skip', t => t.end());

export function testTimeout(t, func) {
  t.test('with timeout', t => {
    let originalDateNow;
    t.before(() => { originalDateNow = Date.now; });
    t.afterEach(() => { Date.now = originalDateNow; });
  
    const timeout = 1000;
    const a = ''.padEnd(1024, 'a  ').split(/\s+/);
    const o = ''.padEnd(1024, 'o  ').split(/\s+/);
    const b = ''.padEnd(1024, 'b  ').split(/\s+/);
  
    t.test('should throw', t => {
      let time = 0;
      Date.now = () =>  {
        const res = time;
        time += timeout + 1;
        return res;
      };
      t.throws(() => func({ a, o, b, timeout }), new Diff3.TimeoutError());
      t.end();
    });
  
    t.test('should not throw', t => {
      Date.now = () =>  0;
      t.doesNotThrow(() => func({ a, o, b, timeout }));
      t.end();
    });
  
    t.end();
  });
}
