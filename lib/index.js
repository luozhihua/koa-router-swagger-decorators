"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("koa-swagger-decorator"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./decorators"), exports);
__exportStar(require("./route"), exports);
var decorators_1 = require("./decorators");
Object.defineProperty(exports, "prefix", { enumerable: true, get: function () { return decorators_1.prefix; } });
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return decorators_1.createRouter; } });
Object.defineProperty(exports, "request", { enumerable: true, get: function () { return decorators_1.requests; } });
var validator_1 = require("./validator");
Object.defineProperty(exports, "validator", { enumerable: true, get: function () { return validator_1.ajv; } });
//# sourceMappingURL=index.js.map