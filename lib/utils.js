"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = "get";
exports.POST = "post";
exports.DELETE = "delete";
exports.PUT = "put";
exports.PATCH = "patch";
exports.OPTION = "option";
class HttpStatusError extends Error {
    constructor(status, message, errorCode) {
        super(message);
        this.status = status;
        this.message = message;
        this.errorCode = errorCode || 0;
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
        let { data, message = "", status = 200, success = true, errorCode = 0, noWrapper = false, } = options;
        this.data = data;
        this.status = status;
        this.message = message;
        this.errorCode = errorCode;
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
            errorCode: ctx.state.errorCode || 0,
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