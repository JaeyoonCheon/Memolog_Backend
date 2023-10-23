export class APIResponse<T> {
  httpStatusCode: number;
  result?: T;

  constructor({
    httpStatusCode,
    result,
  }: {
    httpStatusCode: number;
    result?: T;
  }) {
    this.httpStatusCode = httpStatusCode;
    this.result = result;
  }
}
