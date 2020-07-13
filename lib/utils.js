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
    if (result &&
        typeof result.data === "undefined" &&
        typeof result.success === "undefined") {
        return new HttpResponse({
            data: result,
            message: ctx.message || ctx.state.message || "",
            status: 200,
            errorCode: ctx.state.errorCode || 0,
            success: true,
        });
    }
    else if (!result) {
        return new HttpResponse({
            data: ctx.body || null,
            message: ctx.message || ctx.state.message || "",
            status: 200,
            errorCode: ctx.state.errorCode || 0,
            success: true,
        });
    }
    else {
        return result;
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