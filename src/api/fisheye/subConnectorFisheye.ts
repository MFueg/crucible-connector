import { ParentConnectorReference, SubConnector } from '../../util/subConnector';
import { RestUri } from '../../util/restUri';
import { ChangeSetResponse } from './interfaces/changeSet';
import { HttpCodes } from 'typed-rest-client/HttpClient';

/***********************************************************************************************
 *
 *                                      F I S H E Y E
 *
 ***********************************************************************************************/

export interface GetRepositoryChangeSetsOptions {
  /**
   * the key of the repository
   */
  readonly repositoryKey?: string;

  /**
   * repository path
   */
  readonly repositoryPath?: string;

  /**
   * ID of the committer
   */
  readonly committerId?: string;

  /**
   * comment to match
   */
  readonly comment?: string;

  /**
   * Perforce option to select the changesets marked as fixing
   */
  readonly p4JobFixed?: string;

  /**
   * expand query parameter to specify the maximum number of results
   */
  readonly expand?: string;

  /**
   * parent of the changesets
   */
  readonly beforeCsId?: string;
}

/**
 * SubConnector class that provides API methods of fisheye
 *
 * Fisheye - API Documentation
 * https://docs.atlassian.com/fisheye-crucible/latest/wadl/fisheye.html
 */
export class SubConnectorFisheye extends SubConnector {
  /**
   * Creates a new sub connector
   * @param parentReference Parent connector
   */
  public constructor(parentReference: ParentConnectorReference) {
    super(parentReference);
  }

  /********************** Changeset API **********************/

  /**
   * Uri for requests to the change set domain
   */
  private get uriChangesets() {
    return new RestUri('/rest-service-fe/changeset-v1');
  }

  /**
   * List of changesets from a repository.
   * @param options Options to search for changesets
   */
  public getRepositoryChangeSets(options: GetRepositoryChangeSetsOptions): Promise<ChangeSetResponse> {
    return new Promise((resolve, reject) => {
      this.uriChangesets
        .addPart('listChangesets')
        .setArgsFromObject(options)
        .get<ChangeSetResponse | Error>('get-server-status', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let status = r.get<ChangeSetResponse>(HttpCodes.OK);
          if (status) {
            resolve(status);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
