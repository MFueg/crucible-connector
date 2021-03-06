import { Link, Details } from '../../interfaces/common';

export interface ChangeSetExtended {
  newerChangeSetsExist: boolean;
  olderChangeSetsExist: boolean;
  change: Change[];
}

export interface Change {
  csid: string;
  date: number;
  author: string;
  comment: string;
  link: Link;
  revision: Revision[];
}

export interface Revision {
  path: string;
  revision: string;
  details: Details;
  diffRevision: Details;
  link: Link;
}

export interface Listing {
  path: string;
  dir: Directory[];
  file: Revision[];
}

export interface Directory {
  path: string;
  link: Link;
}

export interface AddChangeSet {
  repository: string;
  changesets: ChangeSets;
}

export interface ChangeSets {
  changesetData: ChangeSet[];
}

export interface ChangeSet {
  id: string;
}
