export type RepositoryAny = RepositoryGit | RepositoryCVS | RepositoryHg | RepositorySvn | RepositoryP4;

export type RepositoryType = 'svn' | 'git' | 'hg' | 'cvs' | 'p4';

export interface Repository {
  type: RepositoryType;
  name: string;
  description: string;
  storeDiff: boolean;
  enabled: boolean;
}

export interface AuthBasic {
  username: string;
  password: string;
}

export interface AuthKeyGenerate {
  authType: 'key-generate';
}

export interface AuthPassword {
  authType: 'password';
  password: string;
}

export interface AuthKey {
  authType: string;
  privateKey: string;
  publicKey: string;
}

// SVN

export interface RepositorySvn extends Repository {
  type: 'svn';
  svn: Svn;
}

export interface Svn {
  url: string;
  path: string;
  auth: AuthBasic;
  blockSize: number;
  commandTimeout: string;
  connectionsPerSecond: number;
  charset: string;
  accessCode: string;
  startRevision: number;
  initialImport: string;
  followBase: boolean;
  usingBuiltinSymbolicRules: boolean;
  trunks: Filter[];
  branches: Filter[];
  tags: Filter[];
}

export interface Filter {
  regex: string;
  name: string;
  logicalPathPrefix?: string;
}

// GIT

export interface RepositoryGit extends Repository {
  type: 'git';
  git: Git;
}

export interface Git {
  location: string;
  path?: string;
  auth: AuthKeyGenerate | AuthPassword;
  blockSize: number;
  commandTimeout: string;
  renameDetection: string;
}

// HG

export interface RepositoryHg extends Repository {
  type: 'hg';
  hg: Hg;
}

export interface Hg {
  location: string;
  auth: AuthKey;
  blockSize: number;
  commandTimeout: string;
}

// CVS

export interface RepositoryCVS extends Repository {
  type: 'cvs';
  cvs: CVS;
}

export interface CVS {
  dir: string;
  charset: string;
}

// P4

export interface RepositoryP4 extends Repository {
  type: 'p4';
  p4: P4;
}

export interface P4 {
  host: string;
  path: string;
  port: number;
  auth: AuthBasic;
  blockSize: number;
  filelogLimit: number;
  commandTimeout: string;
  connectionsPerSecond: number;
  charset: string;
  unicodeServer: boolean;
  skipLabels: boolean;
  caseSensitive: boolean;
  disableMultiplePrint: boolean;
  startRevision: number;
  initialImport: boolean;
}
