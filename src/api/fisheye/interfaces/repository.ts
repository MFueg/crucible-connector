export interface Repositories {
  repository: Repository[];
}

export interface Repository {
  name: string;
  displayName: string;
  enabled: boolean;
  finishedFullSlurp: boolean;
  url?: string;
  path?: string;
  repositoryState: string;
  location?: string;
}
