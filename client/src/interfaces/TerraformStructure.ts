export interface TerraformFile {
  name: string;
  path: string;
  type: string;
}

export interface Project {
  name: string;
  path: string;
  files: TerraformFile[];
}

export interface UsedModule {
  name: string;
  path: string;
  projects: Project[];
}

export interface Account {
  name: string;
  path: string;
  awsProfile?: string;
  sourceProfile?: string;
  assumeRoleArn?: string;
  region?: string;
  usedModules: UsedModule[];
}

export interface Provider {
  name: string;
}

export interface TerraformModule {
  name: string;
  path: string;
  files: TerraformFile[];
}

export interface TerraformStructure {
  rootPath: string;
  accounts: Account[];
  modules: TerraformModule[];
  providers: Provider[];
}