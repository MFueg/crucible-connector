import { IRequestHandler } from 'typed-rest-client/Interfaces';
import { IRequestOptions, RestUri } from './restUri';

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
  protected get host() {
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
   * @param uri Uri to be created
   */
  protected getRestUri(uri: string) {
    return new RestUri(this.webContext, uri);
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
