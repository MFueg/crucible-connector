import { Revision } from './ChangeSet';

export interface History {
	path: string;
	revision: Revision[];
}
