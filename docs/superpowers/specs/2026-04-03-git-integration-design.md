# Git Integration — Design Spec
**Date:** 2026-04-03
**Status:** Approved

---

## Overview

Add a global Git integration module to TerraformExplorer. A single Git repository tracks the entire data structure directory (where `accounts/`, `modules/`, and `providers/` live). Users can commit, push, and pull from a GitHub/GitLab remote, and optionally enable auto-commit on a configurable interval. The frontend exposes a Git button in the header with live status.

---

## Scope

- One global Git repo for the Terraform data directory
- Backend-only git operations via CLI (`Process.Start`) — same pattern as the existing `CommandExecutor`
- PAT-based authentication via environment variables
- Auto-commit using Quartz (already in project)
- Frontend: status badge + dropdown with actions
- `.gitignore` auto-created with sensitive folders excluded
- `git` installed in the backend Docker container

---

## Backend Architecture

### New Files

```
server/TerraformExplorer/
├── Controllers/
│   └── GitController.cs
├── Services/
│   └── GitService.cs
├── Models/
│   ├── Requests/
│   │   ├── GitCommitRequest.cs
│   │   └── GitAutoCommitSettingsRequest.cs
│   └── Responses/
│       └── GitStatusResponse.cs
├── Settings/
│   └── GitSettings.cs
└── Jobs/
    └── AutoCommitJob.cs
```

### GitSettings

Read from environment variables via `IConfiguration`:

```csharp
public class GitSettings {
    public string Token { get; set; }       // GIT_TOKEN
    public string RepoUrl { get; set; }     // GIT_REPO_URL
    public string UserName { get; set; }    // GIT_USER_NAME
    public string UserEmail { get; set; }   // GIT_USER_EMAIL
    public bool AutoCommitEnabled { get; set; }    // default: false
    public int AutoCommitIntervalSeconds { get; set; } // default: 60
}
```

Registered in `ServicesConfig.cs` via `services.Configure<GitSettings>(...)`.

### GitService

Operates on the Terraform root directory (from `TerraformSettings.RootPath`). Uses `CommandExecutor` (existing utility) to spawn `git` processes with working directory set to the repo root.

| Method | Git Command(s) | Notes |
|---|---|---|
| `IsRepoInitializedAsync()` | checks `.git/` existence | No process spawn needed |
| `GetStatusAsync()` | `git status --porcelain` + `git log origin/{branch}..HEAD --oneline` | Returns changed files + unpushed commits count |
| `CommitAsync(message?)` | `git add -A` + `git commit -m "{message}"` | Auto-generates descriptive message if none provided |
| `PushAsync()` | `git push {authenticated-url}` | PAT embedded in URL |
| `PullAsync()` | `git pull` | Returns stdout output |
| `EnsureGitIgnoreAsync()` | Creates/updates `.gitignore` | Called on startup if repo is initialized |
| `ConfigureGitUserAsync()` | `git config user.name` + `git config user.email` | Called once on startup |

**Authenticated URL format:**
`GIT_REPO_URL` is expected to be the bare HTTPS URL (e.g. `https://github.com/user/repo.git`).
At runtime, the service injects credentials: `https://{GIT_USER_NAME}:{GIT_TOKEN}@github.com/user/repo.git`.
The authenticated URL is built in memory and never written to disk or logs.

**Auto-generated commit message logic:**
Parse `git status --porcelain` output, group by status code:
- `M` → modified
- `A` → added
- `D` → deleted
- `R` → renamed

If ≤5 files: `"auto-commit: modified accounts/prod/main.tf, added modules/vpc/variables.tf"`
If >5 files: `"auto-commit: 8 files changed (5 modified, 2 added, 1 deleted) across accounts/, modules/"`

### GitController

Route: `/api/git`

| Endpoint | Method | Description |
|---|---|---|
| `GET /api/git/status` | GET | Returns `GitStatusResponse` |
| `POST /api/git/commit` | POST | Body: `GitCommitRequest { Message? }` |
| `POST /api/git/push` | POST | No body |
| `POST /api/git/pull` | POST | No body |
| `PUT /api/git/auto-commit` | PUT | Body: `GitAutoCommitSettingsRequest { Enabled, IntervalSeconds }` |

### GitStatusResponse

```csharp
public class GitStatusResponse {
    public bool IsInitialized { get; set; }
    public string Branch { get; set; }
    public int UnpushedCommits { get; set; }
    public int ModifiedFiles { get; set; }
    public bool IsSynced { get; set; }         // UnpushedCommits == 0 && ModifiedFiles == 0
    public bool AutoCommitEnabled { get; set; }
    public int AutoCommitIntervalSeconds { get; set; }
    public List<string> ChangedFiles { get; set; }
}
```

### AutoCommitJob (Quartz)

- Registered at startup with interval from `GitSettings.AutoCommitIntervalSeconds`
- Only executes if: repo is initialized + `AutoCommitEnabled == true` + there are uncommitted changes
- Calls `CommitAsync()` (no message → auto-generated) then `PushAsync()`
- Logs result via Serilog
- When `PUT /api/git/auto-commit` is called, the Quartz job is rescheduled dynamically

### .gitignore

At startup, if the repo is initialized, `EnsureGitIgnoreAsync()` reads the existing `.gitignore` (or creates it if absent) and **appends only the missing entries** — never overwrites user-defined content:

```
.aws/
.terraform.d/
.terraform-cache/
```

### Startup Sequence

In `Program.cs` (or a hosted service), on app start:
1. Check if `RootPath/.git` exists
2. If yes: `ConfigureGitUserAsync()` + `EnsureGitIgnoreAsync()`
3. Register `AutoCommitJob` if `AutoCommitEnabled`

---

## Infrastructure Changes

### Dockerfile (backend)

Add `git` to the base image:

```dockerfile
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
```

### docker-compose.yml

Add environment variables to the API service:

```yaml
services:
  api:
    environment:
      - GIT_TOKEN=${GIT_TOKEN}
      - GIT_REPO_URL=${GIT_REPO_URL}
      - GIT_USER_NAME=${GIT_USER_NAME}
      - GIT_USER_EMAIL=${GIT_USER_EMAIL}
```

### .env (root)

Add new variables:

```
GIT_TOKEN=
GIT_REPO_URL=
GIT_USER_NAME=
GIT_USER_EMAIL=
```

---

## Frontend Architecture

### New Files

```
client/src/
├── components/git/
│   ├── GitButton.tsx           # header button with status badge
│   ├── GitStatusPanel.tsx      # dropdown panel with actions + file list
│   └── GitCommitDialog.tsx     # optional message input before commit
├── services/
│   └── GitService.ts
└── interfaces/
    └── responses/
        └── GitStatusResponse.ts
```

### GitButton (Header)

Placed in the existing `Header` component alongside other top-level controls. Displays a badge reflecting current state:

| Badge | Meaning |
|---|---|
| `main ✓` | synced — no changes, no unpushed commits |
| `main ↑2` | 2 unpushed commits |
| `main *` | uncommitted changes |
| `main ↑2 *` | both |
| `no repo` | `.git` not found |

Clicking opens `GitStatusPanel` as a dropdown/popover.

### GitStatusPanel (Dropdown)

```
┌─────────────────────────────────┐
│  ● main  ↑2  *3                 │  ← branch + counts
│  3 files modified               │  ← file list (collapsed if >5)
├─────────────────────────────────┤
│  [ Commit ]  [ Push ]  [ Pull ] │  ← action buttons
├─────────────────────────────────┤
│  Auto-commit    [ ON  ]         │  ← toggle
│  Interval       [ 60s  ▼ ]      │  ← select: 30s, 60s, 5min, 10min
└─────────────────────────────────┘
```

- **Commit** → opens `GitCommitDialog` (user can type a message or leave blank for auto-generated)
- **Push / Pull** → execute immediately, result shown via Sonner toast
- **Auto-commit toggle + interval** → calls `PUT /api/git/auto-commit`

### GitService.ts

```ts
class GitService {
  getStatus(): Promise<GitStatusResponse>
  commit(message?: string): Promise<void>
  push(): Promise<void>
  pull(): Promise<void>
  setAutoCommit(enabled: boolean, intervalSeconds: number): Promise<void>
}
```

### Status Polling

`GitButton` polls `GET /api/git/status` every **30 seconds** via `setInterval` to keep the badge fresh. Also re-fetches after any git action.

---

## Error Handling

- Backend throws `BusinessException` for invalid operations (e.g., push with no remote configured)
- `ExceptionHandlingMiddleware` maps to appropriate HTTP status
- Frontend shows Sonner toast on error with the message returned by the API
- If repo is not initialized, all action buttons are disabled and a message is shown: *"No Git repository found. Clone a repo into the data directory to get started."*

---

## Out of Scope

- `git init` from the UI (user must clone manually)
- Branch switching
- Merge conflict resolution
- GitHub OAuth flow
- Per-account or per-project repositories
