export interface GitStatusResponse {
  isInitialized: boolean;
  branch: string;
  unpushedCommits: number;
  modifiedFiles: number;
  isSynced: boolean;
  autoCommitEnabled: boolean;
  autoCommitIntervalSeconds: number;
  changedFiles: string[];
}
