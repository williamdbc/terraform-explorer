export interface ProjectCopyRequest {
  source: ProjectLocation;
  destination: ProjectLocation;
}

export interface ProjectLocation {
  accountName: string;
  moduleName: string;
  projectName: string;
}