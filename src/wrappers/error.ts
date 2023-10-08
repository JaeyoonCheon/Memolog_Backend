export class CustomError extends Error {
  name: string;

  constructor({ name, message }: { name: string; message: string }) {
    super(message);
    this.name = name;
  }
}

export class ResponseError extends CustomError {
  httpCode: number;

  constructor({
    name,
    message,
    httpCode,
  }: {
    name: string;
    message: string;
    httpCode: number;
  }) {
    super({ name, message });
    this.name = name;
    this.httpCode = httpCode;
  }
}
