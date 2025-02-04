class ApplicationError extends Error {
  constructor(message = 'Application Error', status = 500) {
    super(message);
    this.status = status;
    this.isOperational = true;
  }

  serialize() {
    return {
      message: this.message,
      status: this.status,
    };
  }
}

class NoContentFound extends ApplicationError {
  constructor(message = 'No Content Found') {
    super(message, 204);
  }
}

class BadRequestError extends ApplicationError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class NotFoundError extends ApplicationError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

class InternalServerError extends ApplicationError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

module.exports = {
  ApplicationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
  NoContentFound,
};
