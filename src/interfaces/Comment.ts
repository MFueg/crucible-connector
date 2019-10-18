import { User } from './User';
import { PermaID } from './Common';
import { ReviewMetric } from './ReviewMetric';

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
