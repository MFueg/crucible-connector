export interface PermaID {
  id?: string;
}

export interface TimeZone {
  name: string;
  rawOffset: number;
}

export interface VersionInfo {
  releaseNumber: string;
  buildDate: string;
}

export interface Authentication {
  token: string;
}

export interface Details {}

export interface Link {
  href: string;
  rel: string;
}
