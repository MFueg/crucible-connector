import { User } from './user';
import { PermaID } from './common';
import { ReviewMetric } from './reviewMetric';

export interface Comments {
  comments: Comment[];
}

export interface Comment {
  createDate: number | string;
  defectApproved: boolean;
  defectRaised: boolean;
  deleted: boolean;
  draft?: boolean;
  fromLineRange: string;
  message: string;
  messageAsHtml: string;
  metrics?: ReviewMetric;
  parentCommentId?: ReviewMetric;
  permaId?: PermaID;
  permId?: PermaID;
  readStatus: string;
  replies?: any[];
  reviewItemId: PermaID;
  toLineRange: string;
  user: User;
}

export interface GeneralComment {
  message: string;
  draft: boolean;
  deleted: boolean;
  defectRaised: boolean;
  defectApproved: boolean;
  permaId: PermaID;
  permId: PermaID;
  parentCommentId: PermaID;
}
