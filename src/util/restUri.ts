import { RestClient } from 'typed-rest-client';
import * as trc from 'typed-rest-client/Interfaces';
import { HttpCodes, HttpClient } from 'typed-rest-client/HttpClient';
import * as fs from 'fs';

import tempfile = require('tempfile');
import { Uri } from './uri';

export interface IRequestOptions extends trc.IRequestOptions {}

/**
 * Response class holding the http status code and the result object.
 * The result object can be the requested object or an error.
 *
 * With `get` the result can easily be checked an casted to the expected type.
 */
export class Response<T> {
  private done = false;

  /**
   * Creates a new Response.
   *
   * @param statusCode HTTP status code.
   * @param result Result value ot type `T`.
   */
  public constructor(public readonly statusCode: number, public readonly result: T | null) {}

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

  public resolveIf<U = T>(code: HttpCodes | HttpCodes[], callback: (result: U | undefined) => void) {
    let codes = Array.isArray(code) ? code : [code];
    if (!this.done && this.result != null && (codes.length == 0 || codes.includes(this.statusCode))) {
      callback((this.result as unknown) as U);
      this.done = true;
    }
    return this;
  }

  public rejectIf<U = T>(code: HttpCodes | HttpCodes[], callback: (reason?: any) => void) {
    let codes = Array.isArray(code) ? code : [code];
    if (!this.done && (codes.length == 0 || codes.includes(this.statusCode))) {
      callback((this.result as unknown) as U);
      this.done = true;
    }
    return this;
  }

  public reject<U = T>(callback: (reason?: any) => void) {
    callback((this.result as unknown) as U);
  }
}

/**
 * Uri class with REST methods.
 */
export class RestUri extends Uri {
  /**
   * Creates a new object with a host information `base` and with optional `segments`.
   *
   * @param base Host information (e.g. example.com)
   * @param segments first segments of the uri
   */
  public constructor(base: string, ...segments: string[]) {
    super(base, ...segments);
  }

  /**
   * HTTP GET
   *
   * @param id
   * @param host
   * @param authHandlers
   * @param requestOptions
   */
  public get<Result>(
    id: string,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
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
   * @param host
   * @param authHandlers
   * @param requestOptions
   */
  public create<Result>(
    id: string,
    content: any,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
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
   * @param host
   * @param authHandlers
   * @param requestOptions
   */
  public update<Result>(
    id: string,
    content: any,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
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
   * @param host
   * @param authHandlers
   * @param requestOptions
   */
  public replace<Result>(
    id: string,
    content: any,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
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
   * @param host
   * @param authHandlers
   * @param requestOptions
   */
  public del<Result>(
    id: string,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
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
    host: string,
    stream: NodeJS.ReadableStream,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
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
    id: string,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    return new Promise<Response<Result>>((resolve, reject) => {
      let tempFilePath = tempfile();
      let file: NodeJS.WritableStream = fs.createWriteStream(tempFilePath);
      let client = new HttpClient(id, authHandlers, requestOptions);
      client
        .get(host + '/' + this.toString())
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
}
