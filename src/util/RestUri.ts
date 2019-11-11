import { RestClient } from 'typed-rest-client';
import * as trc from 'typed-rest-client/Interfaces';
import { HttpCodes, HttpClient } from 'typed-rest-client/HttpClient';
import * as fs from 'fs';

import tempfile = require('tempfile');
import { Uri } from './Uri';
import { ContentType } from './SubConnector';

export type IRequestOptions = trc.IRequestOptions;

/**
 * Response class holding the http status code and the result object.
 * The result object can be the requested object or an error.
 *
 * With `get` the result can easily be checked an casted to the expected type.
 */
export class Response<T> {
  /**
   * Creates a new Response.
   *
   * @param statusCode HTTP status code.
   * @param result Result value ot type `T`.
   */
  public constructor(public readonly statusCode: number, public readonly result: T | null) { }

  /**
   * Retrieves the result casted into a selectable Type `U` (default: Result type `T` of the Request).
   *
   * The conversion can be specified with an optional HTTP code an will only return a value unequal
   * to `undefined` if the response status code matches.
   * If no HTTP code is given, the result will always be casted.
   *
   * @param code (optional) HTTP status code when the given type `U` is expected.
   */
  public getResult<U = T>(code?: HttpCodes): U | undefined {
    if (code && code != this.statusCode) {
      return undefined;
    }
    if (this.result == null) {
      return undefined;
    } else {
      return (this.result as unknown) as U;
    }
  }
}

/**
 * Uri class with REST methods.
 */
export class RestUri extends Uri {
  /**
   * Creates a new object with a host information `base` and with optional `segments`.
   *
   * @param host Host information (e.g. example.com)
   * @param authHandlers List of handlers to authenticate
   * @param requestOptions Options used for the http request
   */
  public constructor(
    host: string,
    private readonly authHandlers: trc.IRequestHandler[],
    private readonly requestOptions: IRequestOptions) {
    super(host);
  }

  private get host() {
    return this.base;
  }

  /**
   * Creates a new internal rest client.
   * @param id Id of the request
   */
  private createRestClient(id: string) {
    return new RestClient(id, this.host, this.authHandlers, this.requestOptions);
  }

  /**
   * Creates a new internal http client.
   * @param id Id of the request
   */
  private createHttpClient(id: string) {
    return new HttpClient(id, this.authHandlers, this.requestOptions);
  }

  /**
   * HTTP GET
   *
   * @param id Id of the request.
   */
  public get<Result>(
    id: string
  ): Promise<Response<Result>> {
    return new Promise((resolve, reject) => {
      this.createRestClient(id)
        .get<Result>(this.toString())
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * HTTP POST
   *
   * @param id
   * @param content
   */
  public create<Result>(
    id: string,
    content: any,
  ): Promise<Response<Result>> {
    return new Promise((resolve, reject) => {
      this.createRestClient(id)
        .create<Result>(this.toString(), content)
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * HTTP PATCH
   *
   * @param id
   * @param content
   */
  public update<Result>(
    id: string,
    content: any,
  ): Promise<Response<Result>> {
    return new Promise((resolve, reject) => {
      this.createRestClient(id)
        .update<Result>(this.toString(), content)
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * HTTP PUT
   *
   * @param id
   * @param content
   */
  public replace<Result>(
    id: string,
    content: any,
  ): Promise<Response<Result>> {
    return new Promise((resolve, reject) => {
      this.createRestClient(id)
        .update<Result>(this.toString(), content)
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * HTTP DELETE
   *
   * @param id
   */
  public del<Result>(
    id: string
  ): Promise<Response<Result>> {
    return new Promise((resolve, reject) => {
      this.createRestClient(id)
        .del<Result>(this.toString())
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  public uploadFile<Result>(
    id: string,
    stream: NodeJS.ReadableStream
  ): Promise<Response<Result>> {
    return new Promise((resolve, reject) => {
      this.createRestClient(id)
        .uploadStream<Result>('verb', this.toString(), stream)
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  public loadFile<Result>(
    id: string
  ): Promise<Response<Result>> {
    return new Promise<Response<Result>>((resolve, reject) => {
      let tempFilePath = tempfile();
      let file: NodeJS.WritableStream = fs.createWriteStream(tempFilePath);
      this.createHttpClient(id)
        .get(this.toString())
        .then((r) => {
          r.message.pipe(file).on('close', () => {
            let body: string = fs.readFileSync(tempFilePath).toString();
            let result: Result = JSON.parse(body);
            resolve(new Response(HttpCodes.OK, result));
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * HTTP POST
   *
   * @param id
   * @param content
   */
  public post<Result>(
    id: string,
    content: any,
    contentType?: ContentType
  ): Promise<Response<Result>> {
    return new Promise((resolve, reject) => {
      let additionalHeaders = contentType ? { "Content-Type": contentType } : undefined;
      this.createHttpClient(id)
        .post(this.toString(), content, additionalHeaders)
        .then((response) => {
          response.readBody().then((message) => {
            let statusCode = response.message.statusCode;
            if (statusCode) {
              let result = JSON.parse(message);
              resolve(new Response(statusCode, result));
            } else {
              reject();
            }
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
