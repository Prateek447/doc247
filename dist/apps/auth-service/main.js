/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorMiddleware = void 0;
const _1 = __webpack_require__(5);
const errorMiddleware = (err, req, res) => {
    if (err instanceof _1.AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            details: err.details
        });
    }
    console.error("Unhandled Error", err); // Log the error for debugging
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: 'An unexpected error occurred. Please try again later.'
    });
};
exports.errorMiddleware = errorMiddleware;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RateLimitError = exports.DatabaseError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.BadRequestError = exports.NotFoundError = exports.AppError = void 0;
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
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', details) {
        super(message, 404, true, details);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request', details) {
        super(message, 400, true, details);
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends AppError {
    constructor(message = 'Validation error', details) {
        super(message, 422, true, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details) {
        super(message, 401, true, details);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details) {
        super(message, 403, true, details);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class DatabaseError extends AppError {
    constructor(message = 'Database error', details) {
        super(message, 500, true, details);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded', details) {
        super(message, 429, true, details);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const cors_1 = tslib_1.__importDefault(__webpack_require__(3));
const error_middleware_1 = __webpack_require__(4);
const cookie_parser_1 = tslib_1.__importDefault(__webpack_require__(6));
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API' });
});
app.use(error_middleware_1.errorMiddleware);
const server = app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}/api`);
});
server.on('error', (err) => {
    console.error('Server error:', err);
});

})();

/******/ })()
;
//# sourceMappingURL=main.js.map