import { IRequestHandler } from 'typed-rest-client/Interfaces';
import { IRequestOptions, RestUri } from './RestUri';

export type ContentType = 'application/json' | 'application/x-www-form-urlencoded';

export interface ParentConnectorReference {
  readonly getHost: () => string;
  readonly getWebContext: () => string | undefined;
  readonly getAuthHandlers: () => IRequestHandler[];
  readonly cerateQueryOptions: (requestMimeType?: ContentType, resultMimeType?: ContentType) => IRequestOptions;
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
  private get host() {
    return this.parentReference.getHost();
  }

  /**
   * WebContext where crucible/fisheye runs.
   * It is the first part of the url after the host/port information.
   */
  private get webContext() {
    return this.parentReference.getWebContext() || "";
  }

  /**
   * Creates a new RestUri with the proper context settings.
   * @param base Base uri to be created
   */
  protected getRestUri(base: string) {
    return new RestUri(this.host, this.getAuthHandlers(), this.cerateQueryOptions()).addSegment(this.webContext).addSegment(base);
  }

  /**
   * Returns an array of available authentication handlers.
   */
  private getAuthHandlers() {
    return this.parentReference.getAuthHandlers();
  }

  /**
   * Creates a new request options object.
   * @param requestMimeType Mime type for the request's content
   * @param resultMimeType Mime type for the response's content
   */
  private cerateQueryOptions(requestMimeType?: ContentType, resultMimeType?: ContentType): IRequestOptions {
    return this.parentReference.cerateQueryOptions(requestMimeType, resultMimeType);
  }
}
