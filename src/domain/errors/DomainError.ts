/**
 * Domain-level error carrying an HTTP status code.
 * The global error handler maps `statusCode` to the response.
 */
export class DomainError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'DomainError';
    this.statusCode = statusCode;
  }
}
