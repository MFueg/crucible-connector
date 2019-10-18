import { RestClient } from 'typed-rest-client';
import * as trc from 'typed-rest-client/Interfaces';
import { HttpCodes, HttpClient } from 'typed-rest-client/HttpClient';
import * as fs from 'fs';
import { Error } from '../interfaces/Error';

const tempfile = require('tempfile');

export interface IRequestOptions extends trc.IRequestOptions {}

export class Response<T> {
  public constructor(public readonly statusCode: number, public readonly result: T | null) {}

  public get<U = T>(code?: HttpCodes): U | undefined {
    if (!code || code != this.statusCode) {
      return undefined;
    }
    if (this.result == null) {
      return undefined;
    }
    return (this.result as unknown) as U;
  }

  public getError(fallbackMessage: string = 'Unknown error'): Error {
    let error: Error = {
      code: 'Unknown',
      message: fallbackMessage
    };
    if (this.result != null) {
      let e: Error | undefined = (this.result as unknown) as Error;
      return e ? e : error;
    } else {
      return error;
    }
  }
}

export class RestUri {
  public readonly parts = new Array<string>();
  public readonly args = new Map<string, any>();

  public constructor(private base: string, ...parts: string[]) {
    for (var i = 0; i < parts.length; i++) {
      this.parts.push(parts[i]);
    }
  }

  public setArg(key: string, value: any | any[] | undefined) {
    if (value != undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => this.args.set(key, v));
      } else {
        this.args.set(key, value);
      }
    }
    return this;
  }

  public addPart(part: string) {
    this.parts.push(part);
    return this;
  }

  public str(): string {
    let parts = this.parts.map((p) => encodeURI(p));
    parts.unshift(this.base);
    let url = parts.join('/');
    let urlParams = new Array<string>();
    this.args.forEach((k, v) => {
      urlParams.push(`${encodeURI(k)}=${encodeURI(v)}`);
    });
    if (urlParams.length > 0) {
      url += '?' + urlParams.join('&');
    }
    return url;
  }

  public get<Result>(
    id: string,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
        .get<Result>(this.str())
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject();
        });
    });
  }

  public create<Resource, Result>(
    id: string,
    content: Resource,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
        .create<Result>(this.str(), content)
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject();
        });
    });
  }

  public update<Resource, Result>(
    id: string,
    content: Resource,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
        .update<Result>(this.str(), content)
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject();
        });
    });
  }

  public del<Result>(
    id: string,
    host: string,
    authHandlers: trc.IRequestHandler[],
    requestOptions: IRequestOptions
  ): Promise<Response<Result>> {
    let client = new RestClient(id, host, authHandlers, requestOptions);
    return new Promise((resolve, reject) => {
      client
        .del<Result>(this.str())
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject();
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
        .uploadStream<Result>('verb', this.str(), stream)
        .then((response) => {
          resolve(new Response(response.statusCode, response.result));
        })
        .catch((e) => {
          reject();
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
      client.get(host + '/' + this.str()).then((r) => {
        r.message.pipe(file).on('close', () => {
          let body: string = fs.readFileSync(tempFilePath).toString();
          let result: Result = JSON.parse(body);
          resolve(new Response(HttpCodes.OK, result));
        });
      });
    });
  }
}
