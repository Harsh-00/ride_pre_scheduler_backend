class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  class BadRequestError extends ApiError { constructor(msg) { super(400, msg); } }
  class UnauthorizedError extends ApiError { constructor(msg) { super(401, msg); } }
  class ForbiddenError extends ApiError { constructor(msg) { super(403, msg); } }
  class NotFoundError extends ApiError { constructor(msg) { super(404, msg); } } 

  
  module.exports = { ApiError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError };
  