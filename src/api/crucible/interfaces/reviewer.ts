export interface Reviewers {
  reviewer: Reviewer[];
}

export interface Reviewer {
  userName: string;
  displayName: string;
  avatarUrl: string;
  completed: boolean;
}
