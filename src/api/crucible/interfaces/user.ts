import { TimeZone } from '../../interfaces/common';

export interface User {
	userName: string;
	displayName: string;
	avatarUrl: string;
}

export interface UserProfile {
	userData: User;
	timeZone: TimeZone;
	mappedCommitters: Committers;
	email: string;
	avatarUrl: string;
	preferences: Preferences;
}

export interface Committers {
	committers: Committer[];
}

export interface Committer {
	committerName: string;
	repositoryName: string;
}

export interface Preferences {
	elements: Element[];
}

export interface Element {
	key: string;
	value: string;
}
