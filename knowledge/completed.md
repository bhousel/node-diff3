# Completed

## November 2026

- **Released 4.0.0**, a major release. The library is TypeScript now and ships ESM only (CommonJS users rely on Node's `require()` of ESM), buffer items compare with `===`, and the types are stricter. `LCS` and the merges are much faster on large or repetitive inputs ([#89](https://github.com/bhousel/node-diff3/pull/89), [#95](https://github.com/bhousel/node-diff3/pull/95)). See `CHANGELOG.md` for the breaking changes and `decisions.md` for the reasons.
- **Tooling:** switched from ESLint to oxlint, moved to TypeScript 7, and added `bun run package` to check the published tarball with publint and arethetypeswrong.
- **Agent scaffolding:** synced with agent-practices, which added this `knowledge/` folder.
