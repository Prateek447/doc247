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
var error_middleware_exports = {};
__export(error_middleware_exports, {
  errorMiddleware: () => errorMiddleware
});
module.exports = __toCommonJS(error_middleware_exports);
var import__ = require(".");
const errorMiddleware = (err, req, res) => {
  if (err instanceof import__.AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      details: err.details
    });
  }
  console.error("Unhandled Error", err);
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
    details: "An unexpected error occurred. Please try again later."
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  errorMiddleware
});
