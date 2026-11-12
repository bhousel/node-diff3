import * as Diff3 from './diff3.ts';

declare global {
  var Diff3: typeof import('./diff3.ts');
}

globalThis.Diff3 = Diff3;
