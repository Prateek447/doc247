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
/***/ ((module) => {

module.exports = require("morgan");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("http-proxy-middleware");

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

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const cors_1 = tslib_1.__importDefault(__webpack_require__(3));
const morgan_1 = tslib_1.__importDefault(__webpack_require__(4));
const cookie_parser_1 = tslib_1.__importDefault(__webpack_require__(5));
const express_rate_limit_1 = tslib_1.__importDefault(__webpack_require__(6));
const http_proxy_middleware_1 = __webpack_require__(7);
const app = (0, express_1.default)();
// Basic middleware
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://127.0.0.1:3001'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: (req) => (req.user ? 1000 : 100),
    standardHeaders: true,
    legacyHeaders: true,
    message: { error: 'Too many requests, please try again later.' },
    keyGenerator: (req) => req.ip
});
app.use(limiter);
// Health check endpoint
app.get('/gateway-health', (req, res) => {
    res.send({ message: 'Welcome to api-gateway!' });
});
// Proxy configuration
const proxyOptions = {
    target: 'http://127.0.0.1:6001',
    changeOrigin: true,
    ws: true,
    logLevel: 'debug',
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    },
    onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log('Proxying:', req.method, req.url, 'to', proxyOptions.target + req.url);
    }
};
// Apply proxy middleware
app.use('/', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions));
const port = Number(process.env.PORT) || 8080;
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`API Gateway is running on http://127.0.0.1:${port}`);
});
server.on('error', (err) => {
    console.error('Server error:', err);
});

})();

/******/ })()
;