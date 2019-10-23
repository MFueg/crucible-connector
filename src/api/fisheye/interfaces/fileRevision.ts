export interface FileRevisions {
  fileRevision: FileRevision[];
}

export interface FileRevision {
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

export interface RevisionTags {
  tag: string[];
}