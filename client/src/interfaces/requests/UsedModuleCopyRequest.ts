export interface UsedModuleCopyRequest {
  source: UsedModuleLocation;
  destination: UsedModuleLocation;
}

export interface UsedModuleLocation {
  accountName: string;
  moduleName: string;
}