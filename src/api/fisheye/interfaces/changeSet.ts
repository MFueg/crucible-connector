import { PermaID } from '../../interfaces/common';

export interface ChangeSetResponse {
  changesets: ChangeSets;
}

export interface ChangeSets {
  changeset: ChangeSet[];
}

export interface ChangeSet {
  repositoryName: string;
  csid: string;
  displayId?: string;
  position?: string;
  parents?: string[];
  children?: string[];
  date: number;
  author: string;
  branches?: string[];
  tags?: string[];
  comment: string;
  p4JobIds: string[];
  branch: string;
  fileRevisionKey?: FileRevisionKey[];
}

export interface Reviews {
  size: number;
  review: Review[];
}

export interface Review {
  permaId: PermaID;
  metricsVersion: number;
}

export interface Revisions {
  size: number;
  revision: Revision[];
}

export interface Revision {
  path: string;
  rev: string;
  author: string;
  date: number;
  totalLines: number;
  linesAdded: number;
  linesRemoved: number;
  csid: string;
  comment: string;
  contentLink: string;
  ancestor: string[];
  fileRevisionState: string;
}

export interface ChangeSetIdS {
  resultsTruncated: boolean;
  csid: string[];
}

export interface FileRevisionKey {
  path: string;
  rev: string;
}
