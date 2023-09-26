export class TimeoutError extends Error {}

export interface ILCSResult {
  buffer1index: number;
  buffer2index: number;
  chain: null | ILCSResult;
}

/**
 * Expects two arrays, finds longest common sequence
 * @param {T[]} buffer1
 * @param {T[]} buffer2
 * @returns {ILCSResult}
 * @constructor
 */
export function LCS<T>(buffer1: T[], buffer2: T[], timeout?: number): ILCSResult;

export interface ICommResult<T> {
  buffer1: T[];
  buffer2: T[];
}

/**
 * We apply the LCS to build a 'comm'-style picture of the
 * differences between buffer1 and buffer2.
 * @param {T[]} buffer1
 * @param {T[]} buffer2
 * @returns {Array<ICommResult<T>>}
 */
export function diffComm<T>(buffer1: T[], buffer2: T[], timeout?: number): ICommResult<T>[];

export interface IDiffIndicesResult<T> {
  buffer1: [number, number];
  buffer1Content: T[];
  buffer2: [number, number];
  buffer2Content: T[];
}

/**
 * We apply the LCS to give a simple representation of the
 * offsets and lengths of mismatched chunks in the input
 * buffers. This is used by diff3MergeRegions.
 * @param {T[]} buffer1
 * @param {T[]} buffer2
 * @returns {IDiffIndicesResult<T>[]}
 */
export function diffIndices<T>(
  buffer1: T[],
  buffer2: T[],
  timeout?: number
): IDiffIndicesResult<T>[];

export interface IChunk<T> {
  offset: number;
  length: number;
  chunk: T[];
}

export interface IPatchRes<T> {
  buffer1: IChunk<T>;
  buffer2: IChunk<T>;
}

/**
 * We apply the LCS to build a JSON representation of a
 * diff(1)-style patch.
 * @param {T[]} buffer1
 * @param {T[]} buffer2
 * @returns {IPatchRes<T>[]}
 */
export function diffPatch<T>(buffer1: T[], buffer2: T[], timeout?: number): IPatchRes<T>[];

export function patch<T>(buffer: T[], patch: IPatchRes<T>[], timeout?: number): T[];

export interface IStableRegion<T> {
  stable: true;
  buffer: 'a' | 'o' | 'b';
  bufferStart: number;
  bufferLength: number;
  bufferContent: T[];
}

export interface IUnstableRegion<T> {
  stable: false;
  aStart: number;
  aLength: number;
  aContent: T[];
  bStart: number;
  bLength: number;
  bContent: T[];
  oStart: number;
  oLength: number;
  oContent: T[];
}

export type IRegion<T> = IStableRegion<T> | IUnstableRegion<T>;

/**
 * Given three buffers, A, O, and B, where both A and B are
 * independently derived from O, returns a fairly complicated
 * internal representation of merge decisions it's taken. The
 * interested reader may wish to consult
 *
 * Sanjeev Khanna, Keshav Kunal, and Benjamin C. Pierce.
 * 'A Formal Investigation of ' In Arvind and Prasad,
 * editors, Foundations of Software Technology and Theoretical
 * Computer Science (FSTTCS), December 2007.
 *
 * (http://www.cis.upenn.edu/~bcpierce/papers/diff3-short.pdf)
 *
 * @param {T[]} a
 * @param {T[]} o
 * @param {T[]} b
 * @returns {IRegion<T>[]}
 */
export function diff3MergeRegions<T>(a: T[], o: T[], b: T[], timeout?: number): IRegion<T>[];

export interface MergeRegion<T> {
  ok?: T[];
  conflict?: {
    a: T[];
    aIndex: number;
    b: T[];
    bIndex: number;
    o: T[];
    oIndex: number;
  };
}

export interface MergeResult {
  conflict: boolean;
  result: string[];
}

export interface IMergeOptions {
  excludeFalseConflicts?: boolean;
  stringSeparator?: string | RegExp;
}

/**
 * Applies the output of diff3MergeRegions to actually
 * construct the merged buffer; the returned result alternates
 * between 'ok' and 'conflict' blocks.
 * A "false conflict" is where `a` and `b` both change the same from `o`
 *
 * @param {string | T[]} a
 * @param {string | T[]} o
 * @param {string | T[]} b
 * @param {{excludeFalseConflicts: boolean; stringSeparator: RegExp}} options
 * @returns {MergeRegion<T>[]}
 */
export function diff3Merge<T>(
  a: string | T[],
  o: string | T[],
  b: string | T[],
  options?: IMergeOptions,
  timeout?: number
): MergeRegion<T>[];

export function merge<T>(
  a: string | T[],
  o: string | T[],
  b: string | T[],
  options?: IMergeOptions,
  timeout?: number
): MergeResult;

export function mergeDiff3<T>(
  a: string | T[],
  o: string | T[],
  b: string | T[],
  options?: IMergeOptions & {
    label?: {
      a?: string;
      o?: string;
      b?: string;
    }
  },
  timeout?: number
): MergeResult;

export function mergeDigIn<T>(
  a: string | T[],
  o: string | T[],
  b: string | T[],
  options?: IMergeOptions,
  timeout?: number
): MergeResult;
