export interface ProjectGroupCopyRequest {
  source: ProjectGroupLocation;
  destination: ProjectGroupLocation;
}

export interface ProjectGroupLocation {
  accountName: string;
  groupName: string;
}