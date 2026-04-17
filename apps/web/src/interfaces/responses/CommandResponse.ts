export interface CommandResponse {
  output: string;
  exitCode: number;
  executionTimeMs: number;
  command: string;
  workingDir?: string;
  timestamp: Date;
}