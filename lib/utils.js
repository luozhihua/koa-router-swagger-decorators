"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = 'get';
exports.POST = 'post';
exports.DELETE = 'delete';
exports.PUT = 'put';
exports.PATCH = 'patch';
exports.OPTION = 'option';
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
        this.message = '';
        this.success = true;
        this.errorCode = 0;
        let { data, message = '', status = 200, success = true, errorCode = 0 } = options;
        this.data = data;
        this.status = status;
        this.message = message;
        this.success = success;
    }
}
exports.HttpResponse = HttpResponse;
function defaultFormatter(ctx, result) {
    if (result && typeof result.data === 'undefined' && typeof result.success === 'undefined') {
        return new HttpResponse({
            data: result,
            message: ctx.message || ctx.state.message || '',
            status: 200,
            errorCode: ctx.state.errorCode || 0,
            success: true,
        });
    }
    else if (!result) {
        return new HttpResponse({
            data: ctx.body || null,
            message: ctx.message || ctx.state.message || '',
            status: 200,
            errorCode: ctx.state.errorCode || 0,
            success: true,
        });
    }
    else {
        return result;
    }
}
exports.defaultFormatter = defaultFormatter;
//# sourceMappingURL=utils.js.map