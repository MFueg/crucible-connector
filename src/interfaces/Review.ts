import { User } from './User';
import { PermaID } from './Common';
import { Comments } from './Comment';

export type ReviewFilter =
  | 'allReviews' //All reviews for everyone.
  | 'allOpenReviews' //Open reviews for everyone.
  | 'allClosedReviews' //Closed reviews for everyone.
  | 'draftReviews' //Draft reviews for everyone.
  | 'toReview' //Reviews on which the current user is an uncompleted reviewer.
  | 'requireMyApproval' //Reviews waiting to be approved by the current user.
  | 'toSummarize' //Completed reviews which are ready for the current user to summarize.
  | 'outForReview' //Reviews with uncompleted reviewers, on which the current reviewer is the moderator.
  | 'drafts' //Draft reviews created by the current user.
  | 'open' //Open reviews created by the current user.
  | 'completed' //Open reviews where the current user is a completed reviewer.
  | 'closed' //Closed reviews created by the current user.
  | 'trash'; //Abandoned reviews created by the current user.

export type ReviewTransitionName =
  | 'action:abandonReview' // abandon (i.e. cancel) a review
  | 'action:deleteReview' // permanently delete a review
  | 'action:submitReview' // submit a review to the moderator for approval
  | 'action:approveReview' // approve a review (i.e. issue it to the reviewers)
  | 'action:rejectReview' // reject a review submitted for approval
  | 'action:summarizeReview' // summarize a review
  | 'action:closeReview' // close a review once it has been summarized
  | 'action:reopenReview' // re-open a closed review
  | 'action:recoverReview'; // recover an abandoned review

export type ReviewState = 'Draft' | 'Approval' | 'Review' | 'Summarize' | 'Closed' | 'Dead' | 'Rejected' | 'Unknown';

export type ReviewsQuery = Reviews;

export interface Reviews {
  reviewData: Review[];
}

export interface Review {
  actions?: Actions;
  allowReviewersToJoin: boolean;
  author: User;
  createDate: string;
  creator: User;
  description: string;
  dueDate: string;
  generalComments?: Comments;
  jiraIssueKey: string;
  metricsVersion: number;
  moderator: User;
  name: string;
  permaId: PermaID;
  permaIdHistory: string[];
  projectKey: string;
  reviewItems?: ReviewItems;
  state: string;
  summary: string;
  transitions?: Transitions;
  type: string;
}

export interface CreateReview {
  reviewData: Review;
  patch: string;
  anchor: Anchor;
  changesets: Changesets;
}

export interface ReviewItems {
  reviewItem: ReviewItem[];
}

export interface ReviewItem {
  anchorData?: Anchor;
  authorName: string;
  commitDate: number;
  commitType: string;
  expandedRevisions?: any[];
  fileType: string;
  fromContentUrl: string;
  fromPath: string;
  fromRevision: string;
  participants: Participant[];
  patchUrl?: string;
  permId: PermaID;
  repositoryName: string;
  showAsDiff: boolean;
  toContentUrl: string;
  toPath: string;
  toRevision: string;
}

export interface Anchor {
  anchorPath: string;
  anchorRepository: string;
  stripCount: number;
}

export interface Changesets {
  changesetData: PermaID[];
  repository: string;
}

export interface Actions {
  actionData: Action[];
}

export interface Action {
  name: string;
  displayName: string;
}

export interface Participant {
  user: User;
  completed: boolean;
}

export interface Transitions {
  transitionData: Transition[];
}

export interface Transition {
  name: string;
  displayName: string;
}

export interface CloseReviewSummary {
  summary: string;
}

export interface ReviewTransitions {
  transitionData: ReviewTransition[];
}

export interface ReviewTransition {
  name: ReviewTransitionName;
  displayName: string;
}
