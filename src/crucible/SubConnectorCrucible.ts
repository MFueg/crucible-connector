import { normalize } from 'path';
import { HttpCodes } from 'typed-rest-client/HttpClient';
import { AddChangeSet, Change, Listing } from '../crucible/interfaces/ChangeSet';
import { Comment, Comments, GeneralComment } from '../crucible/interfaces/Comment';
import { VersionInfo } from '../crucible/interfaces/Common';
import { Error, ReviewError } from '../crucible/interfaces/Error';
import { History } from '../crucible/interfaces/History';
import { Patch, PatchGroups } from '../crucible/interfaces/Patch';
import { Repositories, Repository, RepositoryType } from '../crucible/interfaces/Repository';
import {
  CloseReviewSummary,
  CreateReview,
  Review,
  ReviewFilter,
  ReviewItem,
  ReviewItems,
  Reviews,
  ReviewState,
  ReviewTransitionName,
  ReviewTransitions
} from '../crucible/interfaces/Review';
import { Reviewers } from '../crucible/interfaces/Reviewer';
import { ReviewMetrics } from '../crucible/interfaces/ReviewMetric';
import { ReviewRevisions } from '../crucible/interfaces/ReviewRevision';
import { User, UserProfile } from '../crucible/interfaces/User';
import { VersionedEntity } from '../crucible/interfaces/Version';
import { SubConnector, ParentConnectorReference } from '../util/SubConnector';
import { RestUri } from '../util/restUri';

/***********************************************************************************************
 *
 *                                      C R U C I B L E
 *
 ***********************************************************************************************/

/**
 * Options used to search repositories with `searchRepositories`.
 */
export interface SearchRepositoriesOptionsI {
  /**
   * Filter repositories by the repository key, only repositories of keys
   * containing this value would be returned if value was provided. Case insensitive.
   */
  readonly name?: string;
  /**
   * Filter repositories by enabled flag.
   * Only enabled/disabled repositories would be returned accordingly if value was provided.
   */
  readonly enabled?: boolean;
  /**
   * Filter repositories by its availability.
   * Only available/unavailable repositories would be returned accordingly if value was provided.
   */
  readonly available?: boolean;
  /**
   * Filter repositories by type. Allowed values: cvs, svn, p4, git, hg, plugin (for light SCM repositories).
   * Parameter can be specified more than once.
   */
  readonly types?: RepositoryType[];
  /**
   * Maximum number of repositories to be returned (default:1000).
   * export interface SearchRepositoriesOptionsI {
   */
  readonly limit?: number;
}

/**
 * Options used to search change sets with `searchChangeSets`.
 */
export interface SearchChangeSetsOptionsI {
  /**
   * Only return change sets after this change set. If omitted there is no restriction.
   */
  readonly oldestCsId?: string;
  /**
   * Include the change set with id "from" in the change sets returned.
   */
  readonly includeOldest?: string;
  /**
   * Only return change sets before this change set. If omitted there is no restriction.
   */
  readonly newestCsId?: string;
  /**
   * Include the change set with id "to" in the change sets returned.
   */
  readonly includeNewest?: string;
  /**
   * Return only the newest change sets, to the given maximum.
   */
  readonly max?: string;
}

export interface SearchReviewsOptionsI {
  /**
   * A string that will be searched for in review titles.
   */
  readonly title?: string;
  /**
   * Reviews authored by this user.
   */
  readonly author?: string;
  /**
   * Reviews moderated by this user.
   */
  readonly moderator?: string;
  /**
   * Reviews created by this user.
   */
  readonly creator?: string;
  /**
   * Array of review states.
   */
  readonly states?: ReviewState[];
  /**
   * Reviews reviewed by this user.
   */
  readonly reviewer?: string;
  /**
   * Whether the value of author, creator, moderator and reviewer should be OR'd (orRoles=true) or AND'd (orRoles=false) together.
   */
  readonly orRoles?: boolean;
  /**
   * Reviews that the specified reviewer has completed.
   */
  readonly complete?: boolean;
  /**
   * Reviews that all reviewers have completed.
   */
  readonly allReviewersComplete?: boolean;
  /**
   * Reviews for the specified project.
   */
  readonly project?: string;
  /**
   * Reviews with last activity date after the specified timestamp, in milliseconds. Inclusive.
   */
  readonly fromDate?: Date;
  /**
   * Reviews with last activity date before the specified timestamp, in milliseconds. Inclusive.
   */
  readonly toDate?: Date;
}

/**
 * SubConnector class that provides API methods of crucible.
 *
 * Crucible API - Documentation
 * https://docs.atlassian.com/fisheye-crucible/latest/wadl/crucible.html
 */
export class SubConnectorCrucible extends SubConnector {
  /**
   * Creates a new sub connector
   * @param parentReference Parent connector
   */
  public constructor(parentReference: ParentConnectorReference) {
    super(parentReference);
  }

  /********************** USER API **********************/

  /**
   * Uri for requests to the user domain
   */
  private get uriUsers() {
    return new RestUri('/rest-service/users-v1');
  }

  /**
   * Get a list of all the users. You can also ask for a set of users.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:users-v1
   *
   * @param usernameFilter A username (or a few) to limit the number of returned entries.
   *                       It will return only existing users.
   */
  public getUsers(usernameFilter: string[] = []): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.uriUsers
        .setArg('username', usernameFilter)
        .get<User[] | Error>('get-users', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let users = r.get<User[]>(HttpCodes.OK);
          if (users) {
            resolve(users);
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
   * Returns the user details of the user mapped to a committer in a repository.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:users-v1:repository:username
   *
   * @param repository the key of the repository
   * @param username the username of the committer
   */
  public getUserCommitter(repository: string, username: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.uriUsers
        .addPart(repository)
        .addPart(username)
        .get<User>('get-user-committer', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let user = r.get<User>(HttpCodes.OK);
          if (user) {
            resolve(user);
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
   * Returns the user's profile details.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:users-v1:username
   *
   * @param username the username of the user
   */
  public getUserProfile(username: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      this.uriUsers
        .addPart(username)
        .get<UserProfile>('get-user-profile', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let profile = r.get<UserProfile>(HttpCodes.OK);
          if (profile) {
            resolve(profile);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /********************** SEARCH API **********************/

  /**
   * Uri for requests to the search domain
   */
  private get uriSearch() {
    return new RestUri('/rest-service/search-v1');
  }

  /**
   * Search for reviews where the name, description, state or permaId contain the specified term.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:search-v1:reviews
   *
   * @param term search term
   * @param maxReturn the maximum number of reviews to return.
   */
  public searchReview(term: string, maxReturn: number): Promise<Reviews> {
    return new Promise((resolve, reject) => {
      this.uriSearch
        .setArg('term', term)
        .setArg('maxReturn', maxReturn)
        .get<Reviews | Error>('search-review', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let reviews = r.get<Reviews>(HttpCodes.OK);
          if (reviews) {
            resolve(reviews);
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
   * Get a list of all reviews that have been linked to the specified JIRA issue key.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:search-v1:reviewsForIssue
   *
   * @param jiraKey a Jira issue key (e.g. "FOO-3453")
   * @param maxReturn the maximum number of reviews to return.
   */
  public getReviewsForIssue(jiraKey: string, maxReturn: number): Promise<Reviews> {
    return new Promise((resolve, reject) => {
      this.uriSearch
        .setArg('jiraKey', jiraKey)
        .setArg('maxReturn', maxReturn)
        .get<Reviews | Error>('get-review-for-issue', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let reviews = r.get<Reviews>(HttpCodes.OK);
          if (reviews) {
            resolve(reviews);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /********************** REPOSITORY API **********************/

  /**
   * Uri for requests to the repository domain
   */
  private get uriRepositories() {
    return new RestUri('/rest-service/repositories-v1');
  }

  /**
   * Returns a list of all repositories. This includes plugin provided repositories.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:repositories-v1
   *
   * @param options Options to search repositories
   */
  public searchRepositories(options: SearchRepositoriesOptionsI): Promise<Repositories> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .setArg('name', options.name)
        .setArg('enabled', options.enabled)
        .setArg('available', options.available)
        .setArgs('type', options.types, 'repeat')
        .setArg('limit', options.limit)
        .get<Repositories | Error>('search-repositories', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<Repositories>(HttpCodes.OK);
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
   * Returns the raw content of the specified file revision as a binary stream.
   * No attempt is made to identify the content type and no mime type is provided.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:repositories-v1:content:repository:revision:path:.*$
   *
   * @param repository the key of the Crucible SCM plugin repository.
   * @param revision the SCM revision string.
   * @param path the path of a file.
   */
  public getFileRevisionContent(repository: string, revision: string, path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .addPart('content')
        .addPart(repository)
        .addPart(revision)
        .addPart(path)
        .loadFile<string>('get-file-revision-content', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<string>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Returns a particular changeset.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:repositories-v1:change:repository:revision
   *
   * @param repository the key of the Crucible SCM plugin repository.
   * @param revision the SCM revision string.
   */
  public getChangeSet(repository: string, revision: string): Promise<Change> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .addPart('change')
        .addPart(repository)
        .addPart(revision)
        .get<Change>('get-changeset', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Change>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Represents a sorted list of changesets, newest first.
   * Note that when providing a path, use a trailing slash in the request url to indicate
   * that it is a directory (use a "/" for the root directory of the repository).
   * This may be necessary for some SCM plugins (including svn-light).
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:repositories-v1:changes:repository:path:.*$
   *
   * @param repository the key of the Crucible SCM plugin repository.
   * @param path only show change sets which contain at least one revision with a path under this path.
   *             Changesets with some revisions outside this path still include all revisions.
   *             i.e. Revisions outside the path are **not** excluded from the change set.
   * @param options Options to search change sets.
   */
  public searchChangeSets(repository: string, path: string, options: SearchChangeSetsOptionsI): Promise<Change> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .addPart('changes')
        .addPart(repository)
        .addPart(path)
        .setArg('path', path)
        .setArg('oldestCsid', options.oldestCsId)
        .setArg('includeOldest', options.includeOldest)
        .setArg('newestCsid', options.newestCsId)
        .setArg('includeNewest', options.includeNewest)
        .setArg('max', options.max)
        .get<Change>('search-changesets', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Change>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Represents the details of a versioned entity (file or directory).
   * This resource can be reached by following the file's self-link from a browse result.
   *
   * Note that most responses support title expansion to minimize the costs of accessing the resources.
   * Since file meta data is not always provided by SCM plugins, it is not expanded by default in the rest responses.
   * Use title expansion to explicitly make Crucible include it.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:repositories-v1:repository:revision:path:.*$
   *
   * @param repository the key of the Crucible SCM plugin repository.
   * @param revision the SCM revision string.
   * @param path the path of a file or versioned directory
   *             (note that versioned directories are not supported by all SCM plugins).
   */
  public getVersionedEntity(repository: string, revision: string, path: string): Promise<VersionedEntity> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .addPart(repository)
        .addPart(revision)
        .addPart(path)
        .get<VersionedEntity>('get-versioned-entity', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<VersionedEntity>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Returns the details of the repository with the specified repository key.
   * When the repository exists, but the user has no access to it (possibly because the user is not authenticated),
   * a 401 is returned.
   *
   * The supplied repository key can be either a Crucible SCM plugin repository, or a FishEye repository.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:repositories-v1:repository
   *
   * @param repository the key of the Crucible SCM plugin repository.
   */
  public getRepository(repository: string): Promise<Repository> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .addPart(repository)
        .get<Repository>('get-repository', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Repository>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Lists the contents of the specified directory.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:repositories-v1:browse:repository:path:.*$
   *
   * @param repository the key of the Crucible SCM plugin repository.
   * @param path path to a directory. When path represents a file name, the result is unspecified.
   */
  public browseRepository(repository: string, path: string): Promise<Listing> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .addPart('browse')
        .addPart(repository)
        .addPart(path)
        .get<Repository>('browse-repository', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Listing>(HttpCodes.OK);
          if (content) {
            resolve(content);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  //
  /**
   * Represents the history of a versioned entity.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:repositories-v1:history:repository:revision:path:.*$
   *
   * @param repository the key of the Crucible SCM plugin repository.
   * @param revision the SCM revision string.
   * @param path the path of a file or versioned directory (note that versioned directories are not supported by all SCM plugins)
   */
  public getVersionedEntityHistory(repository: string, revision: string, path: string): Promise<History> {
    return new Promise((resolve, reject) => {
      this.uriRepositories
        .addPart('history')
        .addPart(repository)
        .addPart(revision)
        .addPart(path)
        .get<History>('browse-repository', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<History>(HttpCodes.OK);
          if (content) {
            resolve(content);
          } else {
            reject(r.getError());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /********************** REVIEW API **********************/

  /**
   * Uri for requests to the review domain
   */
  private get uriReviews() {
    return new RestUri('/rest-service/reviews-v1');
  }

  /**
   * Get all reviews as a list of ReviewData structures.
   * ! Note that this may return a lot of data, so using `filterReviews` is usually better.
   *
   * The state parameter is a comma separated list of state names from the set Draft, Approval, Review,
   * Summarize, Closed, Dead, Rejected, Unknown.
   *
   * @param states only return reviews that are in these states.
   */
  public getReviews(states: ReviewState[]): Promise<Reviews> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .setArgs('state', states, 'join')
        .get<Reviews>('get-reviews', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Reviews>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Create a review from the given createReview element.
   *
   * The sub-elements of the createReview element determine what type of review is created and how it is populated.
   * The following rules govern which sub-elements can be present and how they are used in the review creation process
   *
   *  - If the snippet element is specified a reviewData element must be supplied and no other elements may be supplied.
   *  - At least one of reviewData and detailedReviewData must be supplied.
   *    If both are supplied, the reviewers element of the detailedReviewData element is used.
   *    All other elements of detailedReviewData are ignored.
   *  - If the state element is present and has the value of "Review" in the reviewData (or detailedReviewData if used),
   *    then the review will be approved at creation, where allowed.
   *  - The changesets and path elements can be supplied with either the reviewData or detailedReviewData elements.
   *
   * The response includes the Location header that contains the URL of the newly created entity.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1
   *
   * @param review
   * @param state only return reviews that are in these states.
   */
  public createReview(review: CreateReview, state: string): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .setArg('state', state)
        .create<Review | Error>('create-review', review, this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Review>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Get comment metrics metadata for the specified metrics version.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:metrics:version
   *
   * @param version a metrics version.
   */
  public getReviewCommentMetric(version: string): Promise<ReviewMetrics> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart('metrics')
        .addPart(version)
        .get<ReviewMetrics>('get-review-metrics', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<ReviewMetrics>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Gets the given comment.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId
   *
   * @param reviewId the review perma id
   * @param commentId the comment perma id
   * @param render true if the wiki text should be rendered into html, into the field <messageAsHtml>. (Default: true)
   */
  public getReviewComment(reviewId: string, commentId: string, render?: boolean): Promise<Comment> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .setArg('render', render)
        .get<Comment | Error>('get-review-comment', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Comment>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Deletes the given comment.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId
   *
   * @param reviewId the review perma id
   * @param commentId the comment perma id
   */
  public deleteReviewComment(reviewId: string, commentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .del<Comment | Error>('delete-review-comment', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Updates the comment given by the perma id to the new comment posted.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId
   *
   * @param reviewId the review perma id
   * @param commentId the comment perma id
   */
  public updateReviewComment(reviewId: string, commentId: string, comment: GeneralComment): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .create<void | Error>(
          'update-review-comment',
          comment,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Adds a file to the review, optionally diff'ed to a second file.
   *
   * In contrast to a patch, files can be either binary or text.
   * Depending on the filetype, size and contents, Crucible may be able to display either parts,
   * or the entire file in the review. It is possible to upload two versions of the file, in which
   * case Crucible will display a diff and report that the file was modified.
   * When only a single file is uploaded, Crucible treats the file as newly added.
   *
   * This action returns the ReviewData document on success.
   *
   * This resources uses multipart form-data to receive the file(s), character set indication and
   * optional comments (it does not expect an XML document with embedded files, as that would require
   * the client to first encode the files in Base64). Making a multipart form-data request can be done
   * manually, but you will probably want to use a library.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:addFile
   *
   * @param reviewId the review perma id to add the file
   * @param stream Content to stream
   */
  public addFileToReview(reviewId: string, stream: NodeJS.ReadableStream): Promise<ReviewItem> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('addFile')
        .uploadFile<ReviewItem | Error>(
          'upload-file-to-review',
          this.host,
          stream,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<ReviewItem>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Returns Crucible version information.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:versionInfo
   */
  public getVersionInfo(): Promise<VersionInfo> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart('versionInfo')
        .get<VersionInfo>('get-version-info', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<VersionInfo>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Retrieves all reviews that are in one of the the specified states.
   * For each review all details are included (review items + comments).
   * The wiki rendered comments will be available via the <messageAsHtml> element
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:details
   *
   * @param states the review states to match.
   */
  public getReviewsDetailed(states: ReviewState[]): Promise<Reviews> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart('details')
        .setArgs('state', states, 'join') // TODO: Check
        .get<Reviews>('get-reviews-detailed', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Reviews>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Internal method to filter reviews.
   *
   * Get all the reviews which match the given filter, for the current user.
   *
   * @param detailed set to true if the detailed api should be used.
   * @param filter A predefined filter type.
   */
  private filterReviewsInternal(detailed: boolean, filter: ReviewFilter): Promise<Reviews> {
    return new Promise((resolve, reject) => {
      let id = detailed ? 'filter-reviews-detailed' : 'filter-reviews';
      let uri = this.uriReviews.addPart('filter').addPart(filter);
      if (detailed) {
        uri.addPart('details');
      }
      uri
        .get<Reviews>(id, this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Reviews>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Get all the reviews which match the given filter, for the current user.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:filter:filter
   *
   * @param filter A predefined filter type.
   */
  public filterReviews(filter: ReviewFilter): Promise<Reviews> {
    return this.filterReviewsInternal(false, filter);
  }

  /**
   * Gets a list of all the reviews that match the specified filter criteria.
   * For each review all details are included (review items + comments)
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:filter:filter:details
   *
   * @param filter A predefined filter type.
   */
  public filterReviewsDetailed(filter: ReviewFilter): Promise<Reviews> {
    return this.filterReviewsInternal(true, filter);
  }

  /**
   * Internal method to search for reviews.
   *
   * Returns all (detailed) information of all reviews that satisfy the specified filter parameters and are
   * accessible under the provided credentials.
   *
   * To ignore a property, omit it from the query string.
   *
   * @param detailed set to true if the detailed api should be used.
   * @param options  options to search for reviews.
   */
  private searchReviewsInternal(detailed: boolean, options: SearchReviewsOptionsI): Promise<Reviews> {
    return new Promise((resolve, reject) => {
      let id = detailed ? 'search-reviews-detailed' : 'search-reviews';
      let uri = this.uriReviews.addPart('filter');
      if (detailed) {
        uri.addPart('details');
      }
      uri
        .setArg('title', options.title)
        .setArg('author', options.author)
        .setArg('moderator', options.moderator)
        .setArg('creator', options.creator)
        .setArgs('states', options.states, 'join')
        .setArg('reviewer', options.reviewer)
        .setArg('orRoles', options.orRoles)
        .setArg('complete', options.complete)
        .setArg('allReviewersComplete', options.allReviewersComplete)
        .setArg('project', options.project)
        .setArg('fromDate', options.fromDate ? options.fromDate.getMilliseconds() : undefined)
        .setArg('toDate', options.toDate ? options.toDate.getMilliseconds() : undefined)
        .get<Reviews>(id, this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Reviews>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Returns all reviews that satisfy the specified filter parameters and are accessible under the provided credentials.
   *
   * To ignore a property, omit it from the query string.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:filter
   *
   * @param options  options to search for reviews.
   */
  public searchReviews(options: SearchReviewsOptionsI): Promise<Reviews> {
    return this.searchReviewsInternal(false, options);
  }

  /**
   * Returns all (detailed) information of all reviews that satisfy the specified filter parameters and are
   * accessible under the provided credentials.
   *
   * To ignore a property, omit it from the query string.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:filter:details
   *
   * @param options  options to search for reviews.
   */
  public searchReviewsDetailed(options: SearchReviewsOptionsI): Promise<Reviews> {
    return this.searchReviewsInternal(true, options);
  }

  /**
   * Gets the replies to the given comment.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId:replies
   *
   * @param reviewId the review perma-id (e.g. "CR-45").
   * @param commentId the comment to reply to
   * @param render true if the comments should also be rendered into html, into the element <messageAsHtml>
   */
  public getReviewCommentReplies(reviewId: string, commentId: string, render?: boolean): Promise<Comments> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .addPart('replies')
        .setArg('render', render)
        .get<Comments | Error>('get-comment-replies', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Comments>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Adds a reply to the given comment. This call includes the Location response header that contains the URL
   * of the newly created entity.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId:replies
   *
   * @param reviewId the review perma-id (e.g. "CR-45").
   * @param commentId the comment to reply to
   * @param reply new comment
   */
  public addReviewCommentReply(reviewId: string, commentId: string, reply: GeneralComment): Promise<Comment> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .addPart('replies')
        .create<Comment | Error>(
          'add-comment-reply',
          reply,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<Comment>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * For the effective user, mark all comments in a review as read (except those marked as leave unread).
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:markAllAsRead
   *
   * @param reviewId the review perma-id (e.g. "CR-45").
   */
  public markAllReviewCommentsAsRead(reviewId: string): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart('markAllAsRead')
        .create<Review | Error>(
          'mark-all-review-comments-as-read',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<Review>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Mark the given comment as read for the user used to make this POST.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId:markAsRead
   *
   * @param reviewId the review perma-id (e.g. "CR-45").
   * @param commentId the comment perma id.
   */
  public markReviewCommentAsRead(reviewId: string, commentId: string): Promise<Comment> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .addPart('markAsRead')
        .create<Comment | Error>(
          'mark-review-comment-as-read',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<Comment>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Marks the comment as leave unread to the current user - it will not automatically be marked as read by crucible.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId:markAsLeaveUnread
   *
   * @param reviewId the review perma-id (e.g. "CR-45").
   * @param commentId the comment perma id.
   */
  public markReviewCommentAsLeaveUnread(reviewId: string, commentId: string): Promise<Comment> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .addPart('markAsLeaveUnread')
        .create<Comment | Error>(
          'mark-review-comment-as-leave-unread',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<Comment>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Updates a reply with the given newComment.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId:markAsLeaveUnread
   *
   * @param reviewId the review perma-id (e.g. "CR-45").
   * @param commentId the comment perma id.
   * @param replyId the perma id of the reply to update.
   * @param reply the new reply content.
   */
  public updateReviewCommentReply(
    reviewId: string,
    commentId: string,
    replyId: string,
    reply: GeneralComment
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .addPart('replies')
        .addPart(replyId)
        .create<void | Error>(
          'update-review-comment-reply',
          reply,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Deletes a reply.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:cId:markAsLeaveUnread
   *
   * @param reviewId the review perma-id (e.g. "CR-45").
   * @param commentId the comment perma id.
   * @param replyId the perma id of the reply to delete.
   */
  public deleteReviewCommentReply(reviewId: string, commentId: string, replyId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart(commentId)
        .addPart('replies')
        .addPart(replyId)
        .del<void | Error>('delete-review-comment-reply', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Publishes all the draft comments of the current user.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:publish
   *
   * @param reviewId the review perma id to look for draft comments
   */
  public publishAllDraftReviewComments(reviewId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('publish')
        .create<void | Error>(
          'publish-draft-review-comments',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * publishes the given draft comment.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:publish:cId
   *
   * @param reviewId the review perma id
   * @param commentId the comment perma id
   */
  public publishDraftReviewComment(reviewId: string, commentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('publish')
        .addPart(commentId)
        .create<void | Error>(
          'publish-draft-review-comment',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Completes the review for the current user
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:complete
   *
   * @param reviewId the review perma id
   * @param ignoreWarnings if true then condition failure warnings will be ignored
   */
  public completeReview(reviewId: string, ignoreWarnings?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('complete')
        .setArg('ignoreWarnings', ignoreWarnings)
        .create<void | ReviewError | Error>(
          'complete-review',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
          } else {
            let reviewError = r.get<ReviewError>(HttpCodes.Conflict);
            if (reviewError) {
              reject(reviewError);
            } else {
              reject(r.getError());
            }
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Uncompletes the review for the current user
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:uncomplete
   *
   * @param reviewId the review perma id
   * @param ignoreWarnings if true then condition failure warnings will be ignored
   */
  public uncompleteReview(reviewId: string, ignoreWarnings?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('uncomplete')
        .setArg('ignoreWarnings', ignoreWarnings)
        .create<void | ReviewError | Error>(
          'complete-review',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
          } else {
            let reviewError = r.get<ReviewError>(HttpCodes.Conflict);
            if (reviewError) {
              reject(reviewError);
            } else {
              reject(r.getError());
            }
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Change the state of a review by performing an action on it.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:transition
   *
   * @param reviewId the review perma-id (e.g. "CR-45").
   * @param transition the action to perform
   * @param ignoreWarnings if true then condition failure warnings will be ignored
   */
  public changeReviewState(
    reviewId: string,
    transition: ReviewTransitionName,
    ignoreWarnings?: boolean
  ): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('transition')
        .setArg('action', transition)
        .setArg('ignoreWarnings', ignoreWarnings)
        .create<void | ReviewError | Error>(
          'change-review-state',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<Review>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            let reviewError = r.get<ReviewError>(HttpCodes.Conflict);
            if (reviewError) {
              reject(reviewError);
            } else {
              reject(r.getError());
            }
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Closes the given review with the summary given.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:close
   *
   * @param reviewId the review perma id to close. it should be in the open state
   * @param summary the summary to close the review
   */
  public closeReview(reviewId: string, summary: CloseReviewSummary): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('close')
        .create<void | Error>('close-review', summary, this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Immediately send a reminder to incomplete reviewers about the given review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:remind
   *
   * @param reviewId the review perma id to remind about. it should be in the open state.
   */
  public remindIncompleteReviewers(reviewId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('remind')
        .create<void | Error>(
          'remind-incomplete-reviewers',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Return a list of Reviews which include a particular file.
   * The path parameter must be the full path name of a file in repository, with no leading slash.
   *
   * @param repositoryId the key of the repository to search for file
   * @param path path to find in reviews
   */
  private searchReviewForFileInternal(detailed: boolean, repositoryId: string, path: string): Promise<Reviews> {
    return new Promise((resolve, reject) => {
      let id = detailed ? 'search-for-file-detailed' : 'search-for-file';
      let uri = this.uriReviews.addPart('search').addPart(repositoryId);
      if (detailed) {
        uri.addPart('details');
      }
      uri
        .setArg('path', normalize(path).replace(/^\/+/, '')) // remove leading slash
        .get<Reviews | Error>(id, this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<Reviews>(HttpCodes.OK);
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
   * Return a list of Reviews which include a particular file.
   * The path parameter must be the full path name of a file in repository, with no leading slash.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:search:repository
   *
   * @param repositoryId the key of the repository to search for file
   * @param path path to find in reviews
   */
  public searchReviewForFile(repositoryId: string, path: string): Promise<Reviews> {
    return this.searchReviewForFileInternal(false, repositoryId, path);
  }

  /**
   * Return a list of Reviews which include a particular file.
   * The path parameter must be the full path name of a file in repository, with no leading slash.
   * For each review all details are included (review items + comments).
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:search:repository:details
   *
   * @param repositoryId the key of the repository to search for file
   * @param path path to find in reviews
   */
  public searchReviewForFileDetailed(repositoryId: string, path: string): Promise<Reviews> {
    return this.searchReviewForFileInternal(true, repositoryId, path);
  }

  /**
   * Internal method to get a review.
   *
   * Get a single review by its permId (e.g. "CR-45"). If the review does not exist, a 404 is returned.
   * The moderator element may not exist if the review does not have a Moderator.
   *
   * @param detailed set to true if the detailed api should be used.
   * @param reviewId the permId of the review to delete (e.g. "CR-45").
   */
  private getReviewInternal(detailed: boolean, reviewId: string): Promise<Review> {
    return new Promise((resolve, reject) => {
      let id = detailed ? 'get-review-detailed' : 'get-review';
      let uri = this.uriReviews.addPart(reviewId);
      if (detailed) {
        uri.addPart('details');
      }
      uri
        .get<Review | Error>(id, this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<Review>(HttpCodes.OK);
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
   * Get a single review by its permId (e.g. "CR-45"). If the review does not exist, a 404 is returned.
   * The moderator element may not exist if the review does not have a Moderator.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id
   *
   * @param reviewId the permId of the review to delete (e.g. "CR-45").
   */
  public getReview(reviewId: string): Promise<Review> {
    return this.getReviewInternal(false, reviewId);
  }

  /**
   * Permanently deletes the specified review. The review must have been abandoned.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id
   *
   * @param reviewId the permId of the review to delete (e.g. "CR-45").
   */
  public deleteReview(reviewId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .del<void | Error>('delete-review', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Get a single review by its permId (e.g. "CR-45"). If the review does not exist, a 404 is returned.
   * The moderator element may not exist if the review does not have a Moderator.
   * All details are included (review items + comments).
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:details
   *
   * @param reviewId the permId of the review to delete (e.g. "CR-45").
   */
  public getReviewDetailed(reviewId: string): Promise<Review> {
    return this.getReviewInternal(true, reviewId);
  }

  /**
   * Get a list of the actions which the current user is allowed to perform on the review.
   * This shows actions the user has permission to perform - the review may not be in a suitable state for all
   * these actions to be performed.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:actions
   *
   * @param reviewId the permId of the a review (e.g. "CR-45").
   */
  public getReviewActions(reviewId: string): Promise<ReviewTransitions> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('actions')
        .get<ReviewTransitions | Error>(
          'get-review-actions',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<ReviewTransitions>(HttpCodes.OK);
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
   * Get a list of the actions which the current user can perform on this review, given its current state
   * and the user's permissions.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:transitions
   *
   * @param reviewId the permId of the a review (e.g. "CR-45").
   */
  public getReviewTransitions(reviewId: string): Promise<ReviewTransitions> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('actions')
        .get<ReviewTransitions | Error>(
          'get-review-transitions',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<ReviewTransitions>(HttpCodes.OK);
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
   * Adds a new change set to the review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:addChangeset
   *
   * @param reviewId the perm id of the review to add the changeset to
   * @param changeSet the new change set
   */
  public addReviewChangeSet(reviewId: string, changeSet: AddChangeSet): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('addChangeset')
        .create<Review | Error>(
          'add-review-change-set',
          changeSet,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<Review>(HttpCodes.OK);
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
   * Add the revisions in a patch to an existing review.
   *
   * If the anchor field is filled Crucible will attempt to anchor the patch to the specified repository/path
   *
   * If the source field is filled Crucible will attempt to add the patch to the existing patch with the given source name.
   * Both patches need to be anchored to the same repository. Use GET reviews-v1/{id}/patch to get a list of valid sources.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:patch
   *
   * @param reviewId the review id add the patch to
   * @param patch the patch to add
   */
  public addReviewPatch(reviewId: string, patch: Patch): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('patch')
        .create<Review | Error>('add-review-patch', patch, this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<Review>(HttpCodes.OK);
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
   * Get a list of patches and their details for the given review
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:patch
   *
   * @param reviewId the review id to get the patches for
   */
  public getReviewPatchGroups(reviewId: string): Promise<PatchGroups> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('patch')
        .get<PatchGroups | Error>(
          'get-review-patch-groups',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<PatchGroups>(HttpCodes.OK);
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
   * Adds the given list of revisions to the supplied review item, merging if required.
   * For example, if the review item for a.txt contains revisions 3 to 6, and if:
   *
   * revisions to add is 4 and 5, then a.txt will have revisions 3--4--5--6
   * revisions to add is 2 and 7, then a.txt will have revisions 2--3--6--7
   * revisions to add is just 2, then a.txt will have revisions 2--3--6
   * revisions to add is just 7, then a.txt will have revisions 3--6--7
   * revisions to add is 2 and 4, then a.txt will have revisions 2--3--4--6
   * revisions to add is 4 and 7, then a.txt will have revisions 3--4--6--7
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewitems:riId:revisions
   *
   * @param reviewId the PermId of the review to add the items to (e.g. "CR-345").
   * @param reviewItemId the id of the review item from which to add the list of revisions to (e.g. "CFR-5622").
   * @param revisions a list of revisions to add. If the revision does not exist in the review item, it is ignored.
   */
  public addRevisionsToReviewItem(reviewId: string, reviewItemId: string, revisions: number[]): Promise<ReviewItem> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .addPart(reviewItemId)
        .addPart('revisions')
        .setArgs('rev', revisions, 'join') // TODO: check
        .create<ReviewItem | Error>(
          'add-revisions-to-review-item',
          undefined,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<ReviewItem>(HttpCodes.OK);
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
   * Removes the revisions given from the review item in the review specified by the id.
   *
   * If the review item has no more revisions left, it is automatically deleted.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewitems:riId:revisions
   *
   * @param reviewId the PermId of the review to remove the items from (e.g. "CR-345").
   * @param reviewItemId the id of the review item from which to remove the list of revisions (e.g. "CFR-5622").
   * @param revisions a list of revisions to remove. If the revision does not exist in the review item, it is ignored.
   */
  public deleteRevisionsFromReviewItem(
    reviewId: string,
    reviewItemId: string,
    revisions: number[]
  ): Promise<ReviewItem> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .addPart(reviewItemId)
        .addPart('revisions')
        .setArgs('rev', revisions, 'join') // TODO: Check
        .del<ReviewItem | Error>(
          'delete-revisions-from-review-item',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<ReviewItem>(HttpCodes.OK);
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
   * Removes an item from a review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewitems:riId
   *
   * @param reviewId review id (e.g. "CR-345").
   * @param reviewItemId review item id (e.g. "CFR-6312").
   */
  public deleteReviewItem(reviewId: string, reviewItemId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .addPart(reviewItemId)
        .del<void | Error>('delete-review-item', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Returns detailed information for a specific review item.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewitems:riId
   *
   * @param reviewId review id (e.g. "CR-345").
   * @param reviewItemId review item id (e.g. "CFR-6312").
   */
  public getReviewItem(reviewId: string, reviewItemId: string): Promise<ReviewItem> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .addPart(reviewItemId)
        .del<ReviewItem | Error>('get-review-item', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<ReviewItem>(HttpCodes.OK);
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
   * Return all the comments visible to the requesting user for the review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments
   *
   * @param reviewId the review perma id
   * @param render true if the wiki text should be rendered into html, into the field <messageAsHtml>.
   */
  public getReviewComments(reviewId: string, render?: boolean): Promise<Comments> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .setArg('render', render)
        .get<Comments | Error>('get-review-comments', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Comments>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Add a general comment to the review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments
   *
   * @param reviewId the review perma id
   * @param comment new comment to be added
   */
  public addReviewComment(reviewId: string, comment: GeneralComment): Promise<Comment> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .create<Comment | Error>(
          'add-review-comment',
          comment,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<Comment>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Return all the comments visible to the requesting user for the review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:general
   *
   * @param reviewId the review perma id
   * @param render true if the wiki text should be rendered into html, into the field <messageAsHtml>.
   */
  public getReviewGeneralComments(reviewId: string, render?: boolean): Promise<Comments> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart('general')
        .setArg('render', render)
        .get<Comments | Error>(
          'get-review-general-comments',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<Comments>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Return all the comments visible to the requesting user for the review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments:versioned
   *
   * @param reviewId the review perma id
   * @param render true if the wiki text should be rendered into html, into the field <messageAsHtml>.
   */
  public getReviewVersionedComments(reviewId: string, render?: boolean): Promise<Comments> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('comments')
        .addPart('versioned')
        .setArg('render', render)
        .get<Comments | Error>(
          'get-review-versioned-comments',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<Comments>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Return all the comments visible to the requesting user for the review item.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments
   *
   * @param reviewId the review perma id
   * @param reviewItemId review item id (e.g. "CFR-6312").
   * @param render true if the wiki text should be rendered into html, into the field <messageAsHtml>.
   */
  public getReviewItemComments(reviewId: string, reviewItemId: string, render?: boolean): Promise<Comments> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .addPart(reviewItemId)
        .addPart('comments')
        .setArg('render', render)
        .get<Comments | Error>('get-review-item-comments', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let content = r.get<Comments>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Return all the comments visible to the requesting user for the review item.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:comments
   *
   * @param reviewId the review perma id
   * @param reviewItemId review item id (e.g. "CFR-6312").
   */
  public addReviewItemComments(reviewId: string, reviewItemId: string, comments: Comments): Promise<Comments> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .addPart(reviewItemId)
        .addPart('comments')
        .create<Comments | Error>(
          'add-review-item-comments',
          comments,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let content = r.get<Comments>(HttpCodes.OK);
          if (content) {
            resolve(content);
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
   * Removes the patch with the given id from the review. All of the revisions provided by the patch will be removed as well.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:patch:patchId
   *
   * @param reviewId review id (e.g. "CR-345").
   * @param patchId the id of the patch (as returned by the '{id}/patch' resource)
   */
  public deleteReviewPatch(reviewId: string, patchId: string): Promise<PatchGroups> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('patch')
        .addPart(patchId)
        .del<PatchGroups | Error>('delete-review-patch', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<PatchGroups>(HttpCodes.OK);
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
   * Get a list of reviewers in the review given by the permaid id.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewers
   *
   * @param reviewId the id of the review
   */
  public getReviewReviewers(reviewId: string): Promise<Reviewers> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewers')
        .del<Reviewers | Error>('get-review-reviewers', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<Reviewers>(HttpCodes.OK);
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
   * Adds the given list of reviewers to the review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewers
   *
   * @param reviewId the id of the review
   * @param reviewerIds a list of comma separated reviewers
   */
  public addReviewReviewers(reviewId: string, reviewerIds: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewers')
        .create<Reviewers | Error>(
          'add-review-reviewers',
          reviewerIds.join(','),
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Gets a list of completed reviewers.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewers:completed
   *
   * @param reviewId the id of the review
   */
  public getReviewReviewersCompleted(reviewId: string): Promise<Reviewers> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewers')
        .addPart('completed')
        .get<Reviewers | Error>(
          'get-review-reviewers-completed',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<Reviewers>(HttpCodes.OK);
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
   * Gets a list of reviewers that have not completed the review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewers:uncompleted
   *
   * @param reviewId the id of the review
   */
  public getReviewReviewersUncompleted(reviewId: string): Promise<Reviewers> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewers')
        .addPart('uncompleted')
        .get<Reviewers | Error>(
          'get-review-reviewers-uncompleted',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<Reviewers>(HttpCodes.OK);
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
   * Removes the reviewer from the review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewers:username
   *
   * @param reviewId the id of the review
   * @param reviewerName the name of the reviewer.
   */
  public deleteReviewReviewer(reviewId: string, reviewerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewers')
        .addPart(reviewerName)
        .del<void | Error>('delete-review-reviewer', this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          if (r.statusCode == HttpCodes.OK) {
            resolve();
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
   * Returns a list of all the items in a review.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewers:uncompleted
   *
   * @param reviewId the id of the review
   */
  public getReviewReviewItems(reviewId: string): Promise<ReviewItems> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .get<ReviewItems | Error>(
          'get-review-review-items',
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<ReviewItems>(HttpCodes.OK);
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
   * Internal method.
   *
   * Add the changes between two files in a fisheye repository to the review.
   * This call includes the Location response header that contains the URL of the newly created entity.
   *
   * @param detailed set to true if the detailed api should be used.
   * @param reviewId the id of the review
   * @param reviewItem new review item
   */
  private addReviewReviewItemInternal(
    detailed: boolean,
    reviewId: string,
    reviewItem: ReviewItem
  ): Promise<ReviewItem> {
    return new Promise((resolve, reject) => {
      let id = detailed ? 'add-reviews-review-item-detailed' : 'add-reviews-review-item-';
      let uri = this.uriReviews.addPart(reviewId).addPart('reviewitems');
      if (detailed) {
        uri.addPart('details');
      }
      uri
        .create<ReviewItem | Error>(id, reviewItem, this.host, this.getAuthHandlers(), this.cerateQueryOptions())
        .then((r) => {
          let result = r.get<ReviewItem>(HttpCodes.OK);
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
   * Add the changes between two files in a fisheye repository to the review.
   * This call includes the Location response header that contains the URL of the newly created entity.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewers:uncompleted
   *
   * @param reviewId the id of the review
   * @param reviewItem new review item
   */
  public addReviewReviewItem(reviewId: string, reviewItem: ReviewItem): Promise<ReviewItem> {
    return this.addReviewReviewItemInternal(false, reviewId, reviewItem);
  }

  /**
   * Adds a review item for each of the supplied crucibleRevisionData elements.
   *
   * Provide a list of crucibleRevisionData elements, each one containing the desired shape of the review item.
   * If a crucibleRevisionData element contains a path that already exists
   * (i.e., an existing review item with the same path is in the review), then the crucibleRevisionData element
   * given here will merge the revisions with the existing review item revisions instead of creating a new review item.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewitems:revisions
   *
   * @param reviewId the id of the review
   * @param revisions new review revisions to add
   */
  public addReviewRevisions(reviewId: string, revisions: ReviewRevisions): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .addPart('revisions')
        .create<Review | Error>(
          'add-review-revisions',
          revisions,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<Review>(HttpCodes.OK);
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
   * Adds the given review item to the review. This will always create a new review item,
   * even if there is an existing one with the same data in the review (in which case the existing item will be replaced).
   *
   * The response includes the Location HTTP header.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewitems:details
   *
   * @param reviewId the id of the review
   * @param reviewItem new review item
   */
  public addReviewReviewItemDetailed(reviewId: string, reviewItem: ReviewItem): Promise<ReviewItem> {
    return this.addReviewReviewItemInternal(true, reviewId, reviewItem);
  }

  /**
   * Sets the review item specified by itemId with the given reviewItem.
   * The old review item is discarded. Can only perform this operation if the old review item specified by
   * itemId can be deleted. The old review item's permId is not changed.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/crucible.html#rest-service:reviews-v1:id:reviewitems:riId:details
   *
   * @param reviewId a valid review id (e.g. "CR-345").
   * @param reviewItemId a valid review item id (e.g. "CFR-5622").
   * @param reviewItem New content for the review item.
   */
  public x(reviewId: string, reviewItemId: string, reviewItem: ReviewItem): Promise<ReviewItem> {
    return new Promise((resolve, reject) => {
      this.uriReviews
        .addPart(reviewId)
        .addPart('reviewitems')
        .addPart(reviewItemId)
        .addPart('details')
        .replace<ReviewItem | Error>(
          'update-user-group',
          reviewItem,
          this.host,
          this.getAuthHandlers(),
          this.cerateQueryOptions()
        )
        .then((r) => {
          let result = r.get<ReviewItem>(HttpCodes.OK);
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
}
