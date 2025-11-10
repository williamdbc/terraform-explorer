export interface AccountCopyRequest {
  sourceAccountName: string;
  destinationAccountName: string;
  copyUsedModules: boolean;
}