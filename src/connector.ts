import { BasicCredentialHandler, PersonalAccessTokenCredentialHandler } from 'typed-rest-client/Handlers';
import { HttpCodes } from 'typed-rest-client/HttpClient';
import { IRequestHandler } from 'typed-rest-client/Interfaces';
import { Authentication } from './api/interfaces';
import { Error } from './api/crucible/interfaces';
import { IRequestOptions, RestUri, ContentType } from './util';
import { SubConnectorCommon } from './api/common/subConnectorCommon';
import { SubConnectorFisheye } from './api/fisheye/subConnectorFisheye';
import { SubConnectorCrucible } from './api/crucible/subConnectorCrucible';

/**
 * Basic credential information about the user trying to access Crucible/Fisheye.
 */
export interface ConnectionCredentials {
  readonly username: string;
  readonly password: string;
}

/**
 * Connection options to connect with a crucible/fisheye server.
 */
export interface ConnectionOptions {
  /**
   * Host where crucible/fisheye runs (e.g.: https://crucible.example.com:443)
   * The host string can contain the port information at its end.
   */
  readonly host: string;

  /**
   * The web context under which Fisheye/Crucible is hosted
   * (as configured in the <web-server context=""/> element in the application's config.xml.
   * It is the first part of the url after the host/port information.
   */
  readonly webContext?: string;

  /**
   * If set to true, only the first request is sent with basic auth and all
   * subsequent requests will use an access token.
   */
  readonly useAccessToken?: boolean;

  /**
   * Set to true if https connections should not be validated.
   * This options is useful when using self signed certificates.
   */
  readonly ignoreSslError?: boolean;
}


/**
 * Connector class that provides all available API methods of crucible/fisheye
 * and that handles authentication.
 *
 * Includes the API parts `common`, `crucible` and `fisheye` accessible via members.
 *
 * Crucible REST API Guide
 * https://developer.atlassian.com/server/fisheye-crucible/rest-api-guide/
 */
export class Connector {
  /**
   * Creates a new connector
   * @param connectionOptions Options to connect to the server.
   * @param credentials Basic credentials to authenticate the user.
   */
  public constructor(
    private readonly connectionOptions: ConnectionOptions,
    private readonly credentials: ConnectionCredentials
  ) {
    this.basicAuthHandler = new BasicCredentialHandler(this.credentials.username, this.credentials.password);

    // Initialize sub connectors:
    const parentReference = {
      getHost: () => {
        return this.connectionOptions.host;
      },
      getAuthHandlers: () => {
        return this.getAuthHandlers();
      },
      getWebContext: () => {
        return this.connectionOptions.webContext;
      },
      cerateQueryOptions: (requestMimeType?: ContentType, resultMimeType?: ContentType) => {
        return this.cerateQueryOptions(requestMimeType, resultMimeType);
      }
    };
    this.common = new SubConnectorCommon(parentReference);
    this.fisheye = new SubConnectorFisheye(parentReference);
    this.crucible = new SubConnectorCrucible(parentReference);

    this.refreshAccessToken();
  }

  /**
   * Common API
   */
  public readonly common: SubConnectorCommon;

  /**
   * Fisheye API
   */
  public readonly fisheye: SubConnectorFisheye;

  /**
   * Crucible API
   */
  public readonly crucible: SubConnectorCrucible;


  private basicAuthHandler: IRequestHandler;
  private tokenHandler: IRequestHandler | undefined;

  /**
   * Returns an array of available authentication handlers.
   * The handler `tokenHandler` is preferred over the `basicAuthHandler` if set.
   */
  private getAuthHandlers(): IRequestHandler[] {
    return this.tokenHandler
      ? [this.tokenHandler, this.basicAuthHandler] // maybe here only the token handler should be returned?
      : [this.basicAuthHandler];
  }

  /**
   * Creates a new request options object.
   * @param requestMimeType Mime type for the request's content
   * @param resultMimeType Mime type for the response's content
   */
  private cerateQueryOptions(
    requestMimeType: ContentType = 'application/json',
    resultMimeType: ContentType = 'application/json'
  ): IRequestOptions {
    return {
      headers: {
        'Content-Type': requestMimeType,
        Accept: resultMimeType
      },
      ignoreSslError: this.connectionOptions.ignoreSslError
    };
  }

  /***********************************************************************************************
   *
   *                                        A U T H
   *
   ***********************************************************************************************/

  /********************** AUTH API **********************/
  // More details at: https://developer.atlassian.com/server/fisheye-crucible/authenticating-rest-requests/

  /**
   * Uri for requests to the authentication domain
   */
  private get uriAuth() {
    return new RestUri('/rest-service-fecru/auth');
  }

  /**
   * Refreshes the internal stored access token if `useAccessToken` is enabled.
   */
  private refreshAccessToken() {
    if (this.connectionOptions.useAccessToken) {
      this.uriAuth
        .addSegment('login')
        .create<Authentication | Error>(
          'get-auth-token',
          `userName=${this.credentials.username}&password=${this.credentials.password}`,
          this.connectionOptions.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions('application/x-www-form-urlencoded')
        )
        .then((r) => {
          let auth = r.get<Authentication>(HttpCodes.OK);
          if (auth) {
            this.tokenHandler = new PersonalAccessTokenCredentialHandler(auth.token);
          } else {
            this.tokenHandler = undefined;
          }
        })
        .catch(() => {
          this.tokenHandler = undefined;
        });
    } else {
      this.tokenHandler = undefined;
    }
  }
}
