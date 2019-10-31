export interface PagedRequestOptions {
  limit?: number;
  start?: number;
}

export interface PagedResponseBase {
  start: number;
  limit: number;
  lastPage: boolean;
  size: number;
}

export interface PagedResponse<T> extends PagedResponseBase {
  values: T[];
}

/**
 * Utility function to calculate new paged request options based on a previous response.
 * @param lastResult Result to be continued.
 * @param limit Optional limit for the new request. If not set, the old limit will be used.
 */
export function getNextPagedRequestOptions(
  lastResult: PagedResponseBase,
  limit?: number
): PagedRequestOptions | undefined {
  if (lastResult.lastPage == true) {
    return undefined;
  } else {
    let start = 0;
    if (lastResult.start) start = lastResult.start;
    if (lastResult.size) start += lastResult.size;
    return {
      limit: limit || lastResult.limit,
      start: start
    };
  }
}
