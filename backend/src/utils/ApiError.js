// A small typed error so controllers/services can signal an HTTP status code
// (e.g. throw new ApiError(404, 'Task not found')) and the central error
// handler can translate it into the right response.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { ApiError };
