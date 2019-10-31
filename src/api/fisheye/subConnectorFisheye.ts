import { HttpCodes } from 'typed-rest-client/HttpClient';
import { ParentConnectorReference, SubConnector } from '../../util';
import {
  ChangeSet,
  ChangeSetIdS,
  ChangeSetResponse,
  FileRevision,
  FileRevisions,
  PathInfos,
  Repositories,
  Repository
} from './interfaces';

/***********************************************************************************************
 *
 *                                      F I S H E Y E
 *
 ***********************************************************************************************/

export interface SearchRepositoryChangeSetsOptions {
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

export interface GetRepositoryChangeSetsOptions {
  /**
   * restrict the changesets to those in this path, should be "/" to look at the whole repository.
   */
  readonly path: string;
  /**
   * only return changesets after this date.
   */
  readonly start: string;
  /**
   * only return changesets before this date.
   */
  readonly end: string;
  /**
   * the maximum number of changesets to return.
   */
  readonly max: number;
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
  private get uriChangeSets() {
    return this.getRestUri('/rest-service-fe/changeset-v1');
  }

  /**
   * List of change sets from a repository.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fisheye.html#rest-service-fe:changeset-v1:listChangesets
   *
   * @param options Options to search for change sets
   */
  public searchRepositoryChangeSets(options: SearchRepositoryChangeSetsOptions): Promise<ChangeSetResponse> {
    return new Promise((resolve, reject) => {
      this.uriChangeSets
        .addSegment('listChangesets')
        .setParametersFromObject(options)
        .get<ChangeSetResponse | Error>(
          'search-repository-change-sets',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
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

  /********************** Repository API **********************/

  /**
   * Uri for requests to the repository domain
   */
  private get uriRepositories() {
    return this.getRestUri('/rest-service-fe/repositories-v1');
  }

  /**
   * List all the repositories.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fisheye.html#rest-service-fe:repositories-v1
   */
  public getRepositories(): Promise<Repositories> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .get<Repositories | Error>('get-repositories', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let repositories = r.get<Repositories>(HttpCodes.OK);
          if (repositories) {
            resolve(repositories);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Get the information about a repository.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fisheye.html#rest-service-fe:repositories-v1:repository
   *
   * @param repositoryKey Key of the repository
   */
  public getRepository(repositoryKey: string): Promise<Repository> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .addSegment(repositoryKey)
        .get<Repository | Error>('get-repository', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let repository = r.get<Repository>(HttpCodes.OK);
          if (repository) {
            resolve(repository);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Uri for requests to the repository domain
   */
  private get uriRevision() {
    return this.getRestUri('/rest-service-fe/revisionData-v1');
  }

  /**
   * Get a list of the file revisions for a specific path.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fisheye.html#rest-service-fe:revisionData-v1:pathHistory:repository
   *
   * @param repositoryKey Key of the repository
   * @param path the path to query
   */
  public getRepositoryFileRevisions(repositoryKey: string, path: string): Promise<FileRevisions> {
    return new Promise((resolve, reject) => {
      this.uriRevision
        .addSegment('pathHistory')
        .addSegment(repositoryKey)
        .setParametersFromObject({ path: path })
        .get<FileRevisions | Error>('get-file-revisions', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<FileRevisions>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Get a list of tags associated with a file revision.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fisheye.html#rest-service-fe:revisionData-v1:revisionTags:repository
   *
   * @param repositoryKey Key of the repository
   * @param path the path of the filerevision, with respect to the fisheye repository root.
   * @param revisionId the id of the filerevision to retrieve.
   */
  public getRepositoryFileRevisionTags(
    repositoryKey: string,
    path: string,
    revisionId: string
  ): Promise<FileRevisions> {
    return new Promise((resolve, reject) => {
      this.uriRevision
        .addSegment('revisionTags')
        .addSegment(repositoryKey)
        .setParametersFromObject({ path: path, revision: revisionId })
        .get<FileRevisions | Error>(
          'get-file-revision-tags',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<FileRevisions>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Get a list of information about files and directories in a path.
   *
   *
   * @param repositoryKey Key of the repository
   * @param path the path of the filerevision, with respect to the fisheye repository root.
   */
  public getRepositoryFileInfos(repositoryKey: string, path: string): Promise<PathInfos> {
    return new Promise((resolve, reject) => {
      this.uriRevision
        .addSegment('pathList')
        .addSegment(repositoryKey)
        .setParametersFromObject({ path: path })
        .get<PathInfos | Error>('get-file-infos', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<PathInfos>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Get a file revision.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fisheye.html#rest-service-fe:revisionData-v1:revisionTags:repository
   *
   * @param repositoryKey Key of the repository
   * @param path the path of the filerevision, with respect to the fisheye repository root.
   * @param revisionId the id of the filerevision to retrieve.
   */
  public getRepositoryFileRevision(repositoryKey: string, path: string, revisionId: string): Promise<FileRevision> {
    return new Promise((resolve, reject) => {
      this.uriRevision
        .addSegment('revisionInfo')
        .addSegment(repositoryKey)
        .setParametersFromObject({ path: path, revision: revisionId })
        .get<FileRevision | Error>('get-file-revision', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<FileRevision>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Get a list of changesets on a repository.
   *
   *
   * @param repositoryKey Key of the repository
   * @param options Options to request the list
   */
  public getRepositoryChangeSets(
    repositoryKey: string,
    options: GetRepositoryChangeSetsOptions
  ): Promise<ChangeSetIdS> {
    return new Promise((resolve, reject) => {
      this.uriRevision
        .addSegment('revisionInfo')
        .addSegment(repositoryKey)
        .setParametersFromObject(options)
        .get<ChangeSetIdS | Error>(
          'get-repository-change-sets',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<ChangeSetIdS>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Get a changeset of a repository.
   *
   *
   * @param repositoryKey Key of the repository
   * @param changeSetId Id of the requested change set
   */
  public getRepositoryChangeSet(repositoryKey: string, changeSetId: string): Promise<ChangeSet> {
    return new Promise((resolve, reject) => {
      this.uriRevision
        .addSegment('changeset')
        .addSegment(repositoryKey)
        .addSegment(changeSetId)
        .get<ChangeSet | Error>(
          'get-repository-change-set',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<ChangeSet>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  // TODO: Some methods skipped - might be implemented later
}
