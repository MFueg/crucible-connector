/**
 * Interface to define a set of uri parameters.
 * Each property name will be used as url parameter key.
 */
export interface UriParameterObject {
  [key: string]: any[] | any | undefined;
}

/**
 * Uri class with some utility function to easily create an url with parameters etc.
 */
export class Uri {
  private readonly segments = new Array<string>();
  private readonly args = new Map<string, string[]>();

  /**
   * Creates a new object with a host information `base` and with optional `segments`.
   *
   * @param base Host information (e.g. example.com)
   * @param segments first segments of the uri
   */
  public constructor(private base: string, ...segments: string[]) {
    for (var i = 0; i < segments.length; i++) {
      this.segments.push(segments[i].replace(/^\//, '').replace(/\/$/, ''));
    }
  }

  /**
   * Sets a single or more URL parameters with the given options.
   * Every property of the `parameter` object will be added to the url's paramter list.
   * Undefined values will be ignored.
   *
   * @param parameter Parameter object.
   */
  public setParametersFromObject(parameter: UriParameterObject) {
    if (parameter != undefined) {
      Object.entries(parameter)
        .filter((v) => v[1] != undefined)
        .forEach((v) => {
          const name = v[0];
          const value = v[1];
          if (Array.isArray(value)) {
            this.setParametersFromArray(name, value);
          } else {
            this.setParameter(name, value);
          }
        });
    }
    return this;
  }

  /**
   * Sets a single or more URL parameters with the given values.
   * Every property of the `values` array will be added to the url paramter list.
   * Undefined values will be ignored.
   *
   * @param key Key to use for the values.
   * @param values Array with values for the parameter.
   */
  public setParametersFromArray(key: string, values: any[] | undefined) {
    if (values != undefined && values.length > 0) {
      const strValues = values.map((v) => String(v));
      this.args.set(key, (this.args.get(key) || []).concat(strValues));
    }
    return this;
  }

  /**
   * Sets a specific uri parameter.
   *
   * @param key Key to use for the value.
   * @param value Value for the parameter.
   */
  public setParameter(key: string, value: any | undefined) {
    this.setParametersFromArray(key, [value]);
    return this;
  }

  /**
   * Adds a new uri segment to the uri path.
   *
   * @param segment new uri segment to append to the uri
   */
  public addSegment(segment: string) {
    this.segments.push(segment);
    return this;
  }

  /**
   * Converts the uri to a string.
   */
  public toString(): string {
    let segments = this.segments.map((p) => encodeURI(p));
    segments.unshift(this.base);
    let url = segments.join('/');
    let urlParams = new Array<string>();
    this.args.forEach((vs, k) => {
      vs.forEach((v) => {
        urlParams.push(`${encodeURI(k)}=${encodeURI(v)}`);
      });
    });
    if (urlParams.length > 0) {
      url += '?' + urlParams.join('&');
    }
    return url;
  }
}
