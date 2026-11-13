# Current

## Unreleased breaking changes on `main`

Everything since v3.2.1 is unreleased, and some of it is breaking, so the next release needs a major version bump:
- CommonJS build removed (see `decisions.md`); `require()` needs Node 20.19+ / 22.12+.
- The IIFE bundle moved to `dist/js/diff3.iife.js`.
- `MergeRegion` is now a type alias union (ok | conflict) instead of an interface.
- Buffer items compare with `===`, so non-string inputs that used to match by string form no longer do.

Also unreleased: faster LCS and merges on large or repetitive inputs ([#89](https://github.com/bhousel/node-diff3/pull/89)), stricter generic types, and the `bun run package` checks. `CHANGELOG.md` has no entry for any of this yet; `/release` drafts one.
