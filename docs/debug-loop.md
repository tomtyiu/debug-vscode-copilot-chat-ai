# Debug loop test lane

When iterating on replay/session stepping and trajectory export behavior, use this tight loop:

1. Reproduce the failure locally.
2. Patch the relevant code.
3. Run `npm run test:debug-loop`.
4. Repeat until the lane is green.

`test:debug-loop` is a small, deterministic suite focused on:

- replay parsing and session stepping (`src/extension/replay/...`)
- trajectory export recursion (`src/extension/trajectory/...`)

Run this lane before broader suites (for example `npm run test:unit`) to shorten iteration time and get faster feedback while debugging.
