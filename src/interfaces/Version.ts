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

export interface Details {}

export interface Link {
	href: string;
	rel: string;
}
