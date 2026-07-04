---
description: Improve architecture, duplication, readability, and maintainability while strictly preserving behavior
argument-hint: [module/file/area to refactor]
---

Refactor target: $ARGUMENTS

This command changes code structure without changing behavior. Any behavior change is a bug in the refactor, not an acceptable side effect.

1. **Analyze the current implementation directly**: identify duplication, unclear naming, misplaced abstractions, and architectural friction within the stated scope. If the refactor crosses module/service boundaries or touches more than a few files, dispatch `software-architect` first to define the target structure — apply the plan-gate pattern in `.claude/shared/plan-gate.md` before implementing a large-scope refactor.
2. **Dispatch the relevant engineer subagent(s)** — `backend-engineer` and/or `frontend-engineer` depending on scope — to perform the refactor: reduce duplication, improve readability and maintainability, but preserve external behavior and existing contracts exactly (same inputs → same outputs, same API shapes, same UI behavior/states).
3. **Dispatch `qa-engineer`** for a regression check confirming behavior is unchanged before vs. after — this is a behavior-preservation check, not new test coverage for new behavior (there is none).
4. **Dispatch `code-reviewer`** to review the final result for architectural fit, any remaining duplication, and any behavior drift introduced.
5. **Summarize**: what was restructured and why, and confirm explicitly that both QA and code review found behavior unchanged.
