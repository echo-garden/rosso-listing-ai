# AGENTS.md

## Project Purpose

This project is managed using an AI-driven development workflow.

The goal is to keep requirements, tasks, logs, prompts, and code inside the project folder so that AI coding agents can work with clear context.

## Development Policy

- Always read this file before starting work.
- Always read docs/requirements.md and tasks/current.md before implementation.
- Check git status before editing files.
- Make a short implementation plan before editing.
- Keep changes small and understandable.
- Avoid unnecessary large refactors.
- Do not make destructive changes without explicit confirmation.
- Do not hardcode secrets, passwords, API keys, or tokens.
- Use .env.example for environment variables.
- Record completed work in logs/ai-worklog.md.
- Update tasks/done.md when a task is completed.
- If there are uncertainties, make reasonable assumptions and proceed unless the decision is dangerous or business-critical.


## Git Policy

- Run git status before making changes.
- Treat `master` as the default base branch.
- Create a feature branch from the latest `master` for each task.
- Use short, descriptive English branch names.
- Commit changes after completing each meaningful task.
- Use short, descriptive English commit messages.
- Do not create huge commits that mix unrelated changes.
- Push the feature branch to remote after committing.
- Create a pull request targeting `master` for review.
- Do not push directly to `master`.
- Do not merge pull requests unless explicitly instructed by the user.

## Work Rules

1. Run git status.
2. Read AGENTS.md.
3. Read docs/requirements.md.
4. Read tasks/current.md.
5. Summarize the current task.
6. Create a short plan.
7. Create a feature branch from `master`.
8. Implement the task.
9. Run checks or tests when possible.
10. Summarize changed files.
11. Record the work in logs/ai-worklog.md.
12. Update tasks/done.md if the task is completed.
13. Commit changes.
14. Push the feature branch.
15. Create a pull request targeting `master`.
16. Suggest the next task.


## Safety Rules

- Do not delete large parts of the project without confirmation.
- Do not modify production data directly.
- Do not expose credentials.
- Do not deploy to production without explicit confirmation.
- Do not push directly to `master`.
- Do not merge pull requests without explicit confirmation.
- Do not overwrite user-created files without checking their contents first.


## Preferred Output Style

- Be concrete.
- Show commands when needed.
- Explain what changed and why.
- Keep summaries short but useful.

## Language Policy

- Respond to the user in Japanese by default.
- Keep code, commands, file names, branch names, commit messages, and technical identifiers in English.
- Explain plans, summaries, risks, and next steps in Japanese.
- If the user writes in Japanese, reply in Japanese.


## Dependency Policy

- Do not introduce new frameworks, databases, paid services, or major dependencies without explaining why.
- If a new dependency is necessary, document the reason.
- Prefer simple, maintainable solutions over complex architectures.
