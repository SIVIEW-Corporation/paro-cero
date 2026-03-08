---
name: skill-sync
description: >
  Syncs skill metadata to AGENTS.md Auto-invoke sections.
  Trigger: When updating skill metadata (metadata.scope/metadata.auto_invoke), regenerating Auto-invoke tables, or running ./skills/skill-sync/assets/sync.sh (including --dry-run/--scope).
license: Apache-2.0
metadata:
  author: Purple-Code-sh
  version: '1.0'
  auto_invoke:
    - 'After creating/modifying a skill'
    - 'Regenerate AGENTS.md Auto-invoke tables'
    - 'Troubleshoot why a skill is missing from AGENTS.md auto-invoke'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Purpose

Keeps `AGENTS.md` Auto-invoke sections in sync with skill metadata. In this Next.js v16 project, this ensures all agents have the latest trigger instructions for project-specific skills.

## Required Skill Metadata

Each skill that should appear in Auto-invoke sections needs these fields in `metadata`.

```yaml
metadata:
  author: Purple-Code-sh
  version: '1.0'
  scope: [root] # Target AGENTS.md at the root

  # Action(s) that trigger this skill
  auto_invoke: 'Creating/modifying React components'
  # OR list:
  # auto_invoke:
  #   - 'Use Case 1'
  #   - 'Use Case 2'
```

## Usage

### What It Does

1. Reads all `skills/*/SKILL.md` files.
2. Extracts `metadata.scope` (default: root) and `metadata.auto_invoke`.
3. Updates `AGENTS.md` at the project root with the new "Auto-invoke Skills" table.

---

## Example

Given `skills/nextjs-v16/SKILL.md`:

```yaml
metadata:
  name: nextjs-v16
  author: Purple-Code-sh
  scope: [root]
  auto_invoke:
    - 'App Router / Server Actions'
    - 'Using "use cache" directive'
```

The sync script generates in `AGENTS.md`:

```markdown
### Auto-invoke Skills

| Action                      | Skill        |
| --------------------------- | ------------ |
| App Router / Server Actions | `nextjs-v16` |
| Using "use cache" directive | `nextjs-v16` |
```

---

## Checklist After Modifying Skills

- [ ] Added `metadata.scope: [root]` to the skill
- [ ] Added `metadata.auto_invoke` descriptions
- [ ] Verified `AGENTS.md` updated correctly
