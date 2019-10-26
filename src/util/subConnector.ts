import { IRequestHandler } from 'typed-rest-client/Interfaces';
import { IRequestOptions } from './restUri';

export type ContentType = 'application/json' | 'application/x-www-form-urlencoded';

export class ParentConnectorReference {
  public constructor(
    public readonly getHost: () => string,
    public readonly getAuthHandlers: () => IRequestHandler[],
    public readonly cerateQueryOptions: (requestMimeType?: ContentType, resultMimeType?: ContentType) => IRequestOptions
  ) { }
}

/**
 * COnnector base class to be used as an underlying connector of the core connector.
 */
export class SubConnector {
  /**
   * Creates a new sub connector
   * @param parentConnector Parent connector
   */
  public constructor(private readonly parentReference: ParentConnectorReference) { }

  /**
   * Host where crucible/fisheye runs.
   */
  protected get host() {
    return this.parentReference.getHost();
  }

  /**
   * Returns an array of available authentication handlers.
   */
  protected getAuthHandlers() {
    return this.parentReference.getAuthHandlers();
  }

  /**
   * Creates a new request options object.
   * @param requestMimeType Mime type for the request's content
   * @param resultMimeType Mime type for the response's content
   */
  protected cerateQueryOptions(requestMimeType?: ContentType, resultMimeType?: ContentType): IRequestOptions {
    return this.parentReference.cerateQueryOptions(requestMimeType, resultMimeType);
  }
}
