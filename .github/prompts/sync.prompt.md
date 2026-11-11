---
description: Sync scaffold files in this project against the canonical agent-practices repo (one-time migration to the sync skill)
---

The agent-practices prompt files have moved to Agent Skills in `.claude/skills/`. This file is a one-time migration shim: it installs the new `sync` skill and removes itself.

Edit files using your host environment's structured file-editing tools, not shell stream editors like `sed`.

1. Fetch `https://raw.githubusercontent.com/rapideditor/agent-practices/main/templates/.claude/skills/sync/SKILL.md` and save it in this project as `.claude/skills/sync/SKILL.md`.
2. Fetch `https://raw.githubusercontent.com/rapideditor/agent-practices/main/templates/.sync.manifest.md` and look up the version listed for `.claude/skills/sync/SKILL.md`.
3. In the local `.sync.manifest.md` at the repo root, replace the `.github/prompts/sync.prompt.md` row with a `.claude/skills/sync/SKILL.md` row at that version, dated today.
4. Delete this file (`.github/prompts/sync.prompt.md`).
5. Stop, and tell the user to re-run `/sync`. The new `sync` skill migrates the remaining prompt files.
