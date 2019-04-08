"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("koa-swagger-decorator"));
__export(require("./decorators"));
var decorators_1 = require("./decorators");
exports.request = decorators_1.requests;
var decorators_2 = require("./decorators");
exports.prefix = decorators_2.router;
var router_1 = require("./router");
exports.middleware = router_1.default;
//# sourceMappingURL=index.js.map