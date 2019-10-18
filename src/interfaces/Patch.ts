export interface Patch {
  patch: string;
  anchor?: Anchor;
  source?: string;
}

export interface Anchor {
  anchorPath: string;
  anchorRepository: string;
  stripCount: number;
}

export interface PatchGroups {
  patchGroup: PatchGroup[];
}

export interface PatchGroup {
  patches: PatchRead[];
  sourceName: string;
  displayName: string;
}

export interface PatchRead {
  id: number;
  fileName: string;
  uploadDate: number;
  url: string;
  anchor?: Anchor;
}
