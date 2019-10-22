import { PermaID } from '../../interfaces/common';

export interface ChangeSetResponse {
  changesets: Changesets;
}

export interface Changesets {
  changeset: Changeset[];
}

export interface Changeset {
  repositoryName: string;
  csid: string;
  date: number;
  author: string;
  branch: string;
  comment: string;
  p4JobIds: string[];
  revisions: Revisions;
  reviews: Reviews;
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
