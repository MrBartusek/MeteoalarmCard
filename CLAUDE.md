# CLAUDE.md

**MeteoalarmCard** is a custom dashboard card for Home Assistant that displays weather warnings.

README.md holds the user-facing docs — read it when a task touches one of these: installation (HACS/manual), the configuration options table with example YAML, the supported languages list, the supported integrations table, and themable CSS variables.

# Commands

- `pnpm start` — dev server; add `http://localhost:5000/meteoalarm-card.js` as a resource in a live Home Assistant instance to see the card
- `pnpm run dev` - Run Home Assistant dev instance with pre-seeded integrations and cards. Includes MCP server.
- `pnpm run dev:down` - stop it; `pnpm run dev:clean` - delete `hass-dev/config` once stopped, so the next `dev` is clean
- `pnpm run lint` and `pnpm run build` — the verification steps (there is no test suite); `build` typechecks and bundles, it does not lint
- Translation tools: run `pnpm run build-tools` before `pnpm run fix-translations` or `pnpm run translations-summary`

# Release process

1. `pnpm version patch|minor|major` — creates the version commit (titled e.g. `2.7.2`) and the `v*` tag; push both to `master`
2. `pnpm run build`, then create a GitHub release for the tag and attach `dist/meteoalarm-card.js` as the asset
3. HACS picks up the new release asset on its own

# Code style

- **Translations** — Untranslated keys in `src/localize/languages/` must be `null`, not English text
- **Git** — NEVER run git commands that modify state (`add`, `commit`, `push`, `branch`, `tag`, `merge`, `reset`) without an explicit request. Read-only commands (`status`, `log`, `diff`, `show`) are always fine. Never force push or rewrite a commit that is already pushed; add a new commit instead.
- **Prefer .includes() over chained ||**: use `[A, B, C].includes(value)` instead of `value === A || value === B || value === C`.
- **Comments are rare** — only write one to explain genuinely tricky code or the *why* behind a questionable decision.
- **Lint** —  Before you claim you've completed the task make sure to run linter (`pnpm lint`) and typecheck the code
- **No em dashes** - never write `—` in code, comments, docs or commit messages; use a comma, colon, semicolon or `-`

# Home Assistant docs

The [developer docs](https://developers.home-assistant.io) are best read by fetching raw markdown from the [`home-assistant/developers.home-assistant`](https://github.com/home-assistant/developers.home-assistant) repo, `docs/` directory. Key pages:

- [Custom card](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card) — the card API: element definition, `setConfig`, the `hass` property, `getCardSize`, and the config-editor hooks (`getConfigElement`/`getStubConfig`)
- [Frontend data](https://developers.home-assistant.io/docs/frontend/data) — the `hass` object: entity states and attributes, calling actions, subscribing to updates
- [Registering resources](https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources) — loading external JS into the Home Assistant frontend
- [Custom card feature](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card-feature) — quick-control widgets added to cards
- [Custom badge](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-badge) — badges shown at the top of a dashboard view
