export interface ReviewRevisions {
  revisionData: ReviewRevision[];
}

export interface ReviewRevision {
  source: string;
  path: string;
  rev: string[];
}
