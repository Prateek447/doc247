"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var packages_exports = {};
__export(packages_exports, {
  AppError: () => AppError,
  BadRequestError: () => BadRequestError,
  DatabaseError: () => DatabaseError,
  ForbiddenError: () => ForbiddenError,
  NotFoundError: () => NotFoundError,
  RateLimitError: () => RateLimitError,
  UnauthorizedError: () => UnauthorizedError,
  ValidationError: () => ValidationError
});
module.exports = __toCommonJS(packages_exports);
class AppError extends Error {
  statusCode;
  isOperational;
  details;
  constructor(message, statusCode, isOperational, details) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}
class NotFoundError extends AppError {
  constructor(message = "Resource not found", details) {
    super(message, 404, true, details);
    this.name = "NotFoundError";
  }
}
class BadRequestError extends AppError {
  constructor(message = "Bad request", details) {
    super(message, 400, true, details);
    this.name = "BadRequestError";
  }
}
class ValidationError extends AppError {
  constructor(message = "Validation error", details) {
    super(message, 422, true, details);
    this.name = "ValidationError";
  }
}
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details) {
    super(message, 401, true, details);
    this.name = "UnauthorizedError";
  }
}
class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details) {
    super(message, 403, true, details);
    this.name = "ForbiddenError";
  }
}
class DatabaseError extends AppError {
  constructor(message = "Database error", details) {
    super(message, 500, true, details);
    this.name = "DatabaseError";
  }
}
class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded", details) {
    super(message, 429, true, details);
    this.name = "RateLimitError";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AppError,
  BadRequestError,
  DatabaseError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError
});
