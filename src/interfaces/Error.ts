export type ErrorCode =
  | 'Unknown'
  | 'IllegalArgument'
  | 'IllegalState'
  | 'NotFound'
  | 'NotPermitted'
  | 'PermaIdFormat'
  | 'ReviewContentTooLarge';

export interface Error {
  code: ErrorCode;
  message: string;
}

export interface ReviewError {
  reviewId: string;
  message: string;
  failedConditions: FailedCondition[];
}

export interface FailedCondition {
  resultKey: string;
  message: string;
  severity: string;
}
