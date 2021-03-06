import { Link, Details } from '../../interfaces/common';

export interface Version {
  releaseNumber: string;
  buildDate: string;
}

export interface VersionedEntity {
  path: string;
  revision: string;
  details: Details;
  diffRevision: Details;
  link: Link;
}
