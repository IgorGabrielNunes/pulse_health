export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} "${id}" was not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
