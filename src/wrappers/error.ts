export class ResponseError {
  httpStatusCode: number;
  errorCode?: number;
  message?: string;

  constructor({
    httpStatusCode,
    errorCode,
    message,
  }: {
    httpStatusCode: number;
    errorCode?: number;
    message?: string;
  }) {
    this.httpStatusCode = httpStatusCode;
    this.errorCode = errorCode;
    this.message = message;
  }
}
