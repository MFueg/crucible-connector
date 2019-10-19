import { RestClient } from 'typed-rest-client';
import * as trc from 'typed-rest-client/Interfaces';
import { HttpCodes, HttpClient } from 'typed-rest-client/HttpClient';
import * as fs from 'fs';
import { Error } from '../interfaces/Error';

const tempfile = require('tempfile');

export interface IRequestOptions extends trc.IRequestOptions { }

export class Response<T> {
  public constructor(public readonly statusCode: number, public readonly result: T | null) { }

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
  public readonly args = new Map<string, string[]>();

  public constructor(private base: string, ...parts: string[]) {
    for (var i = 0; i < parts.length; i++) {
      this.parts.push(parts[i]);
    }
  }

  public setArgs(key: string, values: any[] | undefined, type: 'join' | 'repeat' = 'join') {
    if (values != undefined && values.length > 0) {
      const strValues = values.map(v => String(v));
      const newValues: string[] = (type == "join") ? [strValues.join(",")] : strValues;
      this.args.set(key, (this.args.get(key) || []).concat(newValues));
    }
    return this;
  }

  public setArg(key: string, value: any | undefined) {
    if (value != undefined) {
      this.args.set(key, (this.args.get(key) || []).concat(String(value)));
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
    this.args.forEach((vs, k) => {
      vs.forEach(v => {
        urlParams.push(`${encodeURI(k)}=${encodeURI(v)}`);
      });
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
          reject(e);
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
          reject(e);
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
          reject(e);
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
        .uploadStream<Result>('verb', this.str(), stream)
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
        .get(host + '/' + this.str()).then((r) => {
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
