export type RepositoryType = 'cvs' | 'svn' | 'p4' | 'git' | 'hg' | 'plugin';

export interface Repositories {
  repoData: Repository[];
}

export interface RepositoryShort {
  available: boolean;
  displayName: string;
  enabled: boolean;
  name: string;
  path: string;
  type: RepositoryType;
  url: string;
}

export interface Repository {
  available: boolean;
  description?: string;
  displayName: string;
  enabled: boolean;
  hasChangelogBrowser?: boolean;
  hasDirectoryBrowser?: boolean;
  name: string;
  path?: string;
  pluginKey?: string;
  stateDescription?: string;
  type: RepositoryType;
  url?: string;
}
