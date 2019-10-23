import { BasicCredentialHandler, PersonalAccessTokenCredentialHandler } from 'typed-rest-client/Handlers';
import { HttpCodes } from 'typed-rest-client/HttpClient';
import { IRequestHandler } from 'typed-rest-client/Interfaces';
import { Authentication } from './api/interfaces/common';
import { Error } from './api/crucible/interfaces/Error';
import { ContentType, ParentConnectorReference } from './util/subConnector';
import { IRequestOptions, RestUri } from './util/restUri';
import { SubConnectorCommon } from './api/common/SubConnectorCommon';
import { SubConnectorFisheye } from './api/fisheye/subConnectorFisheye';
import { SubConnectorCrucible } from './api/crucible/subConnectorCrucible';

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
   * @param host Host where crucible/fisheye runs (e.g.: https://crucible.example.com:443)
   * @param username Username to authenticate
   * @param password Password to authenticate
   * @param storeSession If set to true, only the first request is sent with basic auth and all
   *                     subsequent requests will use an access token.
   * @param ignoreSslError Set to true if https connections should not be validated.
   *                       This options is useful when using self signed certificates.
   */
  public constructor(
    public readonly host: string,
    readonly username: string,
    readonly password: string,
    private readonly useAccessToken: boolean = true,
    private readonly ignoreSslError: boolean = false
  ) {
    this.basicAuthHandler = new BasicCredentialHandler(this.username, this.password);

    // Initialize sub connectors:
    let parentReference = new ParentConnectorReference(
      () => {
        return this.host;
      },
      () => {
        return this.getAuthHandlers();
      },
      (requestMimeType?: ContentType, resultMimeType?: ContentType) => {
        return this.cerateQueryOptions(requestMimeType, resultMimeType);
      }
    );
    this.common = new SubConnectorCommon(parentReference);
    this.fisheye = new SubConnectorFisheye(parentReference);
    this.crucible = new SubConnectorCrucible(parentReference);

    this.refreshAccessToken();
  }

  private basicAuthHandler: IRequestHandler;
  private tokenHandler: IRequestHandler | undefined;

  /**
   * Returns an array of available authentication handlers.
   * The handler `tokenHandler` is preferred over the `basicAuthHandler` if set.
   */
  public getAuthHandlers(): IRequestHandler[] {
    return this.tokenHandler
      ? [this.tokenHandler, this.basicAuthHandler] // maybe here only the token handler should be returned?
      : [this.basicAuthHandler];
  }

  /**
   * Creates a new request options object.
   * @param requestMimeType Mime type for the request's content
   * @param resultMimeType Mime type for the response's content
   */
  public cerateQueryOptions(
    requestMimeType: ContentType = 'application/json',
    resultMimeType: ContentType = 'application/json'
  ): IRequestOptions {
    return {
      headers: {
        'Content-Type': requestMimeType,
        Accept: resultMimeType
      },
      ignoreSslError: this.ignoreSslError
    };
  }

  /**
   * Common API
   */
  public common: SubConnectorCommon;

  /**
   * Fisheye API
   */
  public fisheye: SubConnectorFisheye;

  /**
   * Crucible API
   */
  public crucible: SubConnectorCrucible;

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
    if (this.useAccessToken) {
      this.uriAuth
        .addSegment('login')
        .create<Authentication | Error>(
          'get-auth-token',
          `userName=${this.username}&password=${this.password}`,
          this.host,
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
