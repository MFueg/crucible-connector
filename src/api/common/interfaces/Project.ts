export interface Project {
  key: string;
  name: string;
  defaultRepositoryName: string;
  storeFileContentInReview: boolean;
  permissionSchemeName: string;
  moderatorEnabled: boolean;
  defaultModerator: string;
  allowReviewersToJoin: boolean;
  defaultDurationInWeekDays: number;
  defaultObjectives: string;
}

export interface ProjectUpdate {
  key: string;
  name: string;
}
