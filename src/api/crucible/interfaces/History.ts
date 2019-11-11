import { Revision } from './changeSet';

export interface History {
  path: string;
  revision: Revision[];
}
