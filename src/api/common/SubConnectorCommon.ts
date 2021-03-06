import { HttpCodes } from 'typed-rest-client/HttpClient';
import { SubConnector, ParentConnectorReference } from '../../util';
import { Error, RepositoryType } from '../crucible/interfaces';
import {
  IndexingStatus,
  PagedRequestOptions,
  PagedResponse,
  Project,
  ProjectUpdate,
  RepositoryAny,
  ReviewerGroup,
  ServerStatus,
  UserCreate,
  UserData,
  UserGroup,
  UserGroupContent,
  UserGroupName,
  UserName,
  UserPassword
} from './interfaces';

/***********************************************************************************************
 *
 *                                       C O M M O N
 *
 ***********************************************************************************************/

export interface GetProjectsPagedOptions extends PagedRequestOptions {
  /**
   * project's name part filter
   */
  readonly name?: string;

  /**
   * project's key part filter
   */
  readonly key?: string;

  /**
   * project's default repository key part filter
   */
  readonly defaultRepositoryName?: string;

  /**
   * project's permission scheme pare name filter
   */
  readonly permissionSchemeName?: string;
}

export interface GetRepositoriesPagedOptions extends PagedRequestOptions {
  /**
   * filter repositories by repository type
   */
  readonly type?: RepositoryType;

  /**
   * filter repositories by enabled flag
   */
  readonly enabled?: boolean;

  /**
   * filter repositories by started flag
   */
  readonly started?: boolean;
}

/**
 * SubConnector class that provides API methods of crucible/fisheye
 * and that handles authentication.
 *
 * Crucible/Fisheye Common API - Documentation
 * https://docs.atlassian.com/fisheye-crucible/latest/wadl/fecru.html
 */
export class SubConnectorCommon extends SubConnector {
  /**
   * Creates a new sub connector
   * @param parentReference Parent connector
   */
  public constructor(parentReference: ParentConnectorReference) {
    super(parentReference);
  }

  private readonly defaultError: Error = { code: 'Unknown', message: 'Unknown error' };

  /********************** INDEXING API **********************/

  // TODO: This part of the API is not completely documented - must be evaluated

  /**
   * Uri for requests to the indexing domain
   */
  private get uriIndexing() {
    return this.getRestUri('/rest-service-fecru/indexing-status-v1');
  }

  /**
   * Returns indexing status of given repository.
   * TODO: Evaluate return type!
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:indexing-status-v1:status:repository
   *
   * @param repositoryId the key of the repository to get status of
   */
  public getRepositoryIndexingStatus(repositoryId: string): Promise<IndexingStatus> {
    return new Promise((resolve, reject) => {
      this.uriIndexing
        .addSegment('status')
        .addSegment(repositoryId)
        .get<IndexingStatus | Error>(
          'get-repository-indexing-status'
        )
        .then((r) => {
          let status = r.getResult<IndexingStatus>(HttpCodes.OK);
          if (status) {
            resolve(status);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /********************** USER PREFERENCE API **********************/

  // TODO: This part of the API is not completely documented - must be evaluated

  /**
   * Uri for requests to the user domain
   */
  // private get uriUserPreferences() {
  //   return this.getRestUri('/rest-service-fecru/user-prefs-v1');
  // }

  /**
   * TODO: Missing documentation
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:user-prefs-v1:property
   */

  /**
   * TODO: Missing documentation
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:user-prefs-v1:repository:property
   */

  /********************** SERVER API **********************/

  /**
   * Uri for requests to the indexing domain
   */
  private get uriServer() {
    return this.getRestUri('/rest-service-fecru/server-v1');
  }

  /**
   * Provides general information about the server's configuration.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:server-v1
   */
  public getServerStatus(): Promise<ServerStatus> {
    return new Promise((resolve, reject) => {
      this.uriServer
        .get<ServerStatus | Error>('get-server-status')
        .then((r) => {
          let status = r.getResult<ServerStatus>(HttpCodes.OK);
          if (status) {
            resolve(status);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /********************** ADMIN API **********************/

  /**
   * Uri for requests to the indexing domain
   */
  private get uriAdmin() {
    return this.getRestUri('/rest-service-fecru/admin');
  }

  /**
   * Creates a new user group.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:groups
   *
   * @param group New user group to create.
   */
  public createUserGroup(group: UserGroup): Promise<UserGroup> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('groups')
        .create<UserGroup | Error>(
          'create-user-group',
          group
        )
        .then((r) => {
          let result = r.getResult<UserGroup>(201);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   *  Retrieve a page of groups.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:groups
   *
   * @param prefix filter groups by name prefix
   * @param options page options.
   */
  public getUserGroupsPaged(prefix: string, options: PagedRequestOptions): Promise<PagedResponse<UserGroup>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('groups')
        .setParametersFromObject({ prefix: prefix })
        .setParametersFromObject(options)
        .get<PagedResponse<UserGroup> | Error>(
          'get-paged-user-groups'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<UserGroup>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Retrieve a group by name.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:groups:name
   *
   * @param groupName Name of the required group
   */
  public getUserGroup(groupName: string): Promise<UserGroup> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('groups')
        .addSegment(groupName)
        .get<UserGroup | Error>('get-user-group')
        .then((r) => {
          let result = r.getResult<UserGroup>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Updates an existing group.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:groups:name
   *
   * @param group Group to be updated. The name is used to identify the group and won't be updated.
   */
  public updateUserGroup(group: UserGroup): Promise<UserGroupContent> {
    return new Promise((resolve, reject) => {
      const content: UserGroupContent = { admin: group.admin };
      this.uriAdmin
        .addSegment('groups')
        .addSegment(group.name)
        .replace<UserGroupContent | Error>(
          'update-user-group',
          content, // only the admin field allowed
        )
        .then((r) => {
          let result = r.getResult<UserGroupContent>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Deletes a group by name.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:groups:name
   *
   * @param groupName Name of the required group
   */
  public deleteUserGroup(groupName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('groups')
        .addSegment(groupName)
        .del<void | Error>('delete-user-group')
        .then((r) => {
          if (r.statusCode == 204) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Lists group's user names.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:groups:name:users
   *
   * @param groupName Name of the requested user group.
   * @param options page options.
   */
  public getUsersOfUserGroupPaged(groupName: string, options: PagedRequestOptions): Promise<PagedResponse<UserName>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('groups')
        .addSegment(groupName)
        .addSegment('users')
        .setParametersFromObject(options)
        .get<PagedResponse<UserName> | Error>(
          'get-paged-users-of-user-group'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<UserName>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Adds a user to a group
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:groups:name:users
   *
   * @param groupName Name of the requested user group.
   * @param userName User to add.
   */
  public addUserToUserGroup(groupName: string, userName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const user: UserName = { name: userName };
      this.uriAdmin
        .addSegment('groups')
        .addSegment(groupName)
        .replace<void | Error>(
          'add-user-to-user-group',
          user
        )
        .then((r) => {
          if (r.statusCode == 204 || r.statusCode == 304) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Removes a user from a group
   * FIXME: Can't be implemented yet, because the typed-rest-client does not provide content at the `del` method.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:groups:name:users
   *
   * @param groupName Name of the requested user group.
   * @param userName User to be removed.
   */
  // public removeUserFromUserGroup(groupName: string, userName: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const user: UserName = { name: userName };
  //     this.uriAdmin
  //       .addSegment('groups')
  //       .addSegment(groupName)
  //       .del<void | Error>('delete-user-from-user-group', user,
  //        this.host,
  //        this.getAuthHandlers(),
  //        this.cerateQueryOptions())
  //       .then((r) => {
  //         if (r.statusCode == 204 || r.statusCode == 304) {
  //           resolve();
  //         } else {
  //           reject(r.getResult<Error>() || this.defaultError);
  //         }
  //       })
  //       .catch((e) => {
  //         reject(e);
  //       });
  //   });
  // }

  /**
   * Creates a new user. Tries to add the user to fisheye-users and crucible-users groups if those exist.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:users
   *
   * @param user New user group to create.
   */
  public createUser(user: UserCreate): Promise<UserData> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('users')
        .create<UserGroup | Error>('create-user', user)
        .then((r) => {
          let result = r.getResult<UserData>(201);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Retrieve a page of users.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:users
   *
   * @param options page options.
   */
  public getUsersPaged(options: PagedRequestOptions): Promise<PagedResponse<UserData>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('users')
        .setParametersFromObject(options)
        .get<PagedResponse<UserGroup> | Error>(
          'get-paged-users'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<UserData>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Retrieve a user by name.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:users:name
   *
   * @param userName Name of the requested user.
   */
  public getUser(userName: string): Promise<UserData> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('users')
        .addSegment(userName)
        .get<UserData | Error>('get-user-data')
        .then((r) => {
          let result = r.getResult<UserData>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Updates an existing user.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:users:name
   *
   * @param userName Name of the requested user.
   * @param password New password.
   */
  public updaterUser(userName: string, password: string): Promise<UserData> {
    return new Promise((resolve, reject) => {
      const user: UserPassword = { password: password };
      this.uriAdmin
        .addSegment('users')
        .addSegment(userName)
        .replace<UserData | Error>(
          'update-user-data',
          user
        )
        .then((r) => {
          let result = r.getResult<UserData>(HttpCodes.OK);
          if (result) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Deletes a user by name
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:users:name
   *
   * @param userName User to be removed.
   */
  public removeUser(userName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('users')
        .addSegment(userName)
        .del<void | Error>('delete-user')
        .then((r) => {
          if (r.statusCode == 204) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Lists user's group names
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:users:name:groups
   *
   * @param userName Name of the requested user.
   * @param options page options.
   */
  public getUserGroupsOfUserPaged(
    userName: string,
    options: PagedRequestOptions
  ): Promise<PagedResponse<UserGroupName>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('users')
        .addSegment(userName)
        .addSegment('groups')
        .setParametersFromObject(options)
        .get<PagedResponse<UserGroupName> | Error>(
          'get-paged-users-of-user-group'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<UserGroupName>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  // TODO: Some methods skipped - might be implemented later

  /**
   * Creates a new project.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects
   *
   * @param project New project to create.
   */
  public createProject(project: Project): Promise<Project> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .create<Project | Error>(
          'create-project',
          project
        )
        .then((r) => {
          let result = r.getResult<Project>(201);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Retrieve a page of projects.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects
   *
   * @param options page options.
   */
  public getProjectsPaged(options: GetProjectsPagedOptions): Promise<PagedResponse<Project>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .setParametersFromObject(options)
        .get<PagedResponse<Project> | Error>(
          'get-paged-projects'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<Project>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Retrieve a project by key.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key
   *
   * @param projectKey project key
   */
  public getProject(projectKey: string): Promise<Project> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .get<Project | Error>('get-project')
        .then((r) => {
          let result = r.getResult<Project>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Updates an existing project.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key
   *
   * @param projectKey project key
   * @param project Project to be updated.
   */
  public updateProject(projectKey: string, project: ProjectUpdate): Promise<Project> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .replace<Project | Error>(
          'update-project',
          project
        )
        .then((r) => {
          let result = r.getResult<Project>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Deletes a project by key (including all reviews in this project).
   * Use `moveProjectContent` to move reviews to another project.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key
   *
   * @param projectKey Project to be deleted.
   * @param deleteProjectReviews if true deletes reviews in project (default: false)
   */
  public deleteProject(projectKey: string, deleteProjectReviews?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .setParametersFromObject({ deleteProjectReviews: deleteProjectReviews })
        .del<void | Error>('delete-project')
        .then((r) => {
          if (r.statusCode == 204) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Move reviews and snippets from source project to destination project.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:sourceProjectKey:move-reviews:destinationProjectKey
   *
   * @param projectKeyFrom project key of reviews and snippets source project
   * @param projectKeyTo project key of reviews and snippets destination project
   */
  public moveProjectContent(projectKeyFrom: string, projectKeyTo: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKeyFrom)
        .addSegment('move-reviews')
        .addSegment(projectKeyTo)
        .replace<void | Error>(
          'move-project-content',
          undefined
        )
        .then((r) => {
          if (r.statusCode == 204) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Retrieves project's default reviewer users
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:default-reviewer-users
   *
   * @param projectKey project key
   * @param options page options.
   */
  public getProjectDefaultReviewUsersPaged(
    projectKey: string,
    options: PagedRequestOptions
  ): Promise<PagedResponse<UserName>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .addSegment('default-reviewer-users')
        .setParametersFromObject(options)
        .get<PagedResponse<UserName> | Error>(
          'get-paged-default-reviewer-users-of-project'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<UserName>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Add user to project's default reviewer users list.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:default-reviewer-users
   *
   * @param projectKey project key
   * @param userName User to add.
   */
  public addDefaultReviewUserToProject(projectKey: string, userName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const user: UserName = { name: userName };
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .addSegment('default-reviewer-users')
        .replace<void | Error>(
          'add-default-reviewer-users-to-project',
          user
        )
        .then((r) => {
          if (r.statusCode == 204 || r.statusCode == 304) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Remove user from project's default reviewer users list.
   * FIXME: Can't be implemented yet, because the typed-rest-client does not provide content at the `del` method.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:default-reviewer-users
   *
   * @param projectKey project key
   * @param userName User to be removed.
   */
  // public removeDefaultReviewUserFromProject(projectKey: string, userName: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const user: UserName = { name: userName };
  //     this.uriAdmin
  //       .addSegment('projects')
  //       .addSegment(projectKey)
  //       .addSegment('default-reviewer-users')
  //       .del<void | Error>('delete-default-reviewer-users-from-project', user, this.host, this.getAuthHandlers(),
  //                          this.cerateQueryOptions())
  //       .then((r) => {
  //         if (r.statusCode == 204 || r.statusCode == 304) {
  //           resolve();
  //         } else {
  //          reject(r.getResult<Error>() || this.defaultError);
  //         }
  //       })
  //       .catch((e) => {
  //         reject(e);
  //       });
  //   });
  // }

  /**
   * Retrieves project's default reviewer groups.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:default-reviewer-groups
   *
   * @param projectKey project key
   * @param options page options.
   */
  public getProjectDefaultReviewerGroupsPaged(
    projectKey: string,
    options: PagedRequestOptions
  ): Promise<PagedResponse<ReviewerGroup>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .addSegment('default-reviewer-groups')
        .setParametersFromObject(options)
        .get<PagedResponse<ReviewerGroup> | Error>(
          'get-paged-default-reviewer-groups-of-project'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<ReviewerGroup>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Add group to project's default reviewer group list.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:default-reviewer-groups
   *
   * @param projectKey project key
   * @param groupName Group to add.
   */
  public addDefaultReviewerGroupToProject(projectKey: string, groupName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const group: ReviewerGroup = { name: groupName };
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .addSegment('default-reviewer-groups')
        .replace<void | Error>(
          'add-default-reviewer-group-to-project',
          group
        )
        .then((r) => {
          if (r.statusCode == 204 || r.statusCode == 304) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Delete group from project's default reviewer group list.
   * FIXME: Can't be implemented yet, because the typed-rest-client does not provide content at the `del` method.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:default-reviewer-groups
   *
   * @param projectKey project key
   * @param groupName User to be removed.
   */
  // public removeDefaultReviewerGroupFromProject(projectKey: string, userName: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const group: ReviewerGroup = { name: groupName };
  //     this.uriAdmin
  //       .addSegment('projects')
  //       .addSegment(projectKey)
  //       .addSegment('default-reviewer-groups')
  //       .del<void | Error>('delete-reviewer-group-from-project', group, this.host, this.getAuthHandlers(),
  //                          this.cerateQueryOptions())
  //       .then((r) => {
  //         if (r.statusCode == 204 || r.statusCode == 304) {
  //           resolve();
  //         } else {
  //         reject(r.getResult<Error>() || this.defaultError);
  //         }
  //       })
  //       .catch((e) => {
  //         reject(e);
  //       });
  //   });
  // }

  /**
   * Retrieves project's allowed reviewer users.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:allowed-reviewer-users
   *
   * @param projectKey project key
   * @param options page options.
   */
  public getProjectAllowedReviewerUsersPaged(
    projectKey: string,
    options: PagedRequestOptions
  ): Promise<PagedResponse<UserName>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .addSegment('allowed-reviewer-users')
        .setParametersFromObject(options)
        .get<PagedResponse<UserName> | Error>(
          'get-paged-allowed-reviewer-users-of-project'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<UserName>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**        
    * Add user to project's allowed reviewer users list.
     *
     * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:allowed-reviewer-users
        *
        * @param projectKey project key
     * @param userName User to add
     * /
    public addAllowedReviewerUserToProject(projectKey: string, userName: string): Promise<void> {
      return new Promise((resolve, reject) => {
      const user: UserName = { name: userName };
      this.uriAdmin
          .addSegment('projects')
          .addSegment(projectKey)
          .addSegment('allowed-reviewer-users')
          .replace<void | Error>(
    'add-default-reviewer-group-to-project',
  user
          )    
          .then((r) => {
    if (r.statusCode == 204 || r.statusCode == 304) {
              resolve();
            } else {
            reject(r.getResult<Error>() || this.defaultError);
            }
          })
          .catch((e) => {
            reject(e);
          });
      });
    }
  
    /**
     * Remove user from project's allowed reviewer users list.
     * FIXME: Can't be implemented yet, because the typed-rest-client does not provide content at the `del` method.
     *
     * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:allowed-reviewer-users
     *
     * @param projectKey project key
     * @param userName User to be removed.
     */
  // public removeAllowedReviewerUserFromProject(projectKey: string, userName: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const user: UserName = { name: userName };
  //     this.uriAdmin
  //       .addSegment('projects')
  //       .addSegment(projectKey)
  //       .addSegment('allowed-reviewer-users')
  //       .del<void | Error>('delete-reviewer-group-from-project', user, this.host, this.getAuthHandlers(),
  //                          this.cerateQueryOptions())
  //       .then((r) => {
  //         if (r.statusCode == 204 || r.statusCode == 304) {
  //           resolve();
  //         } else {
  //          reject(r.getResult<Error>() || this.defaultError);
  //         }
  //       })
  //       .catch((e) => {
  //         reject(e);
  //       });
  //   });
  // }

  /**
   *  Retrieves project's allowed reviewer groups.
   * 
 * https:/ / docs.atlassia n .com/fisheye- crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:allowed-reviewer-users
  *
   * @param projectKey project key
   * @param options page options.
   * /
    public getProjectAllowedReviewerGroupsPaged(
    projectKey: string,
    options: PagedRequestOptions
    ): Promise<PagedResponse<ReviewerGroup>> {
      return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
    .addSegment('allowed-reviewer-groups')
        .setParametersFromObject(options)
        .get < PagedResponse<ReviewerGroup> | Error>(
  'get-paged-allowed-reviewer-groups-of-project'
        )
        .then( (r) => {
  let result = r.getResult<PagedResponse<ReviewerGroup>>(HttpCodes.OK);
  if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
}
 
/**        
  * Add group to project's allowed reviewer group list.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:allowed-reviewer-users
      *
      * @param projectKey project key
   * @param groupName Group to add
   * /
  public addAllowedReviewerGroupToProject(projectKey: string, groupName: string): Promise<void> {
    return new Promise((resolve, reject) => {
    const group: ReviewerGroup = { name: groupName };
    this.uriAdmin
        .addSegment('projects')
        .addSegment(projectKey)
        .addSegment('allowed-reviewer-groups')
        .replace<void | Error>(
  'add-allowed-reviewer-group-to-project',
group
        )    
        .then((r) => {
  if (r.statusCode == 204 || r.statusCode == 304) {
            resolve();
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Remove user from project's allowed reviewer users list.
   * FIXME: Can't be implemented yet, because the typed-rest-client does not provide content at the `del` method.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:projects:key:allowed-reviewer-users
   *
   * @param projectKey project key
   * @param groupName Group to be removed.
   */
  // public removeAllowedReviewerGroupFromProject(projectKey: string, groupName: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const group: ReviewerGroup = { name: groupName };
  //     this.uriAdmin
  //       .addSegment('projects')
  //       .addSegment(projectKey)
  //       .addSegment('allowed-reviewer-groups')
  //       .del<void | Error>('delete-allowed-reviewer-group-from-project', group,
  //        this.host,
  //        this.getAuthHandlers(),
  //        this.cerateQueryOptions())
  //       .then((r) => {
  //         if (r.statusCode == 204 || r.statusCode == 304) {
  //           resolve();
  //         } else {
  //          reject(r.getResult<Error>() || this.defaultError);
  //         }
  //       })
  //       .catch((e) => {
  //         reject(e);
  //       });
  //   });
  // }

  /**
   * TODO: Some methods skipped - might be implemented later
   *
   * - /rest-service-fecru/recently-visited-v1
   *
   */

  /**
   * Creates a repository.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:repositories
   *
   * @param repository New project to create.
   */
  public createRepository(repository: RepositoryAny): Promise<RepositoryAny> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('repositories')
        .create<RepositoryAny | Error>(
          'create-repository',
          repository
        )
        .then((r) => {
          let result = r.getResult<RepositoryAny>(201);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Retrieve a page of repositories. Repository properties with default values may not be returned.
   *
   * https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html#rest-service-fecru:admin:repositories
   *
   * @param options page options.
   */
  public getRepositoriesPaged(options: GetRepositoriesPagedOptions): Promise<PagedResponse<RepositoryAny>> {
    return new Promise((resolve, reject) => {
      this.uriAdmin
        .addSegment('repositories')
        .setParametersFromObject(options)
        .get<PagedResponse<RepositoryAny> | Error>(
          'get-paged-repositories'
        )
        .then((r) => {
          let result = r.getResult<PagedResponse<RepositoryAny>>(HttpCodes.OK);
          if (result) {
            resolve(result);
          } else {
            reject(r.getResult<Error>() || this.defaultError);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
