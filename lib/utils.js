"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.namedFunction = exports.defaultFormatter = exports.HttpResponse = exports.HttpStatusError = exports.OPTION = exports.PATCH = exports.PUT = exports.DELETE = exports.POST = exports.GET = void 0;
exports.GET = "get";
exports.POST = "post";
exports.DELETE = "delete";
exports.PUT = "put";
exports.PATCH = "patch";
exports.OPTION = "option";
class HttpStatusError extends Error {
    constructor(status, message, errors) {
        super(message);
        this.status = status;
        this.message = message;
        this.errors = errors;
    }
}
exports.HttpStatusError = HttpStatusError;
class HttpResponse {
    constructor(options) {
        this.status = 200;
        this.message = "";
        this.success = true;
        this.errorCode = 0;
        this.noWrapper = false;
        let { data, message = "", status = 200, success = true, errors = null, noWrapper = false, } = options;
        this.data = data;
        this.status = status;
        this.message = message;
        this.errors = errors;
        this.success = success;
        this.noWrapper = noWrapper;
    }
}
exports.HttpResponse = HttpResponse;
exports.defaultFormatter = (ctx, result) => {
    if (result instanceof HttpResponse) {
        return result;
    }
    else {
        return new HttpResponse({
            data: result || ctx.body || null,
            message: ctx.message || ctx.state.message || "",
            status: ctx.status,
            success: true,
        });
    }
};
function namedFunction(target, funcName, func) {
    const dynamicNameFuncs = {
        [`${funcName}`]: function (...params) {
            return func.apply(target || null, params);
        },
    };
    const newFunc = dynamicNameFuncs[funcName];
    if (newFunc.name !== funcName) {
        throw new Error("[koa-router-swagger-decorators] - Decorator wrapper does not supported dynamic function name.");
    }
    return newFunc;
}
exports.namedFunction = namedFunction;
//# sourceMappingURL=utils.js.map