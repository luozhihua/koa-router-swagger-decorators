"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("koa-swagger-decorator"));
__export(require("./utils"));
__export(require("./decorators"));
__export(require("./route"));
var decorators_1 = require("./decorators");
exports.prefix = decorators_1.prefix;
exports.default = decorators_1.createRouter;
exports.request = decorators_1.requests;
//# sourceMappingURL=index.js.map