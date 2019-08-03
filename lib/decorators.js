"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const koa_swagger_decorator_1 = require("koa-swagger-decorator");
const swagger_1 = require("./swagger");
exports.GET = 'get';
exports.POST = 'post';
exports.DELETE = 'delete';
exports.PUT = 'put';
exports.PATCH = 'patch';
exports.OPTION = 'option';
exports.rootRouter = new koa_swagger_decorator_1.SwaggerRouter();
exports.RouterEvents = {};
function createRouter(config) {
    exports.RouterEvents.beforeController = config.beforeController;
    exports.RouterEvents.afterController = config.afterController;
    const router = swagger_1.default(config);
    exports.rootRouter.use(router.routes());
    return exports.rootRouter;
}
exports.createRouter = createRouter;
class HttpStatusError extends Error {
    constructor(status, message, errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode || 0;
    }
}
exports.HttpStatusError = HttpStatusError;
class HttpResponse {
    constructor(data, message = '', status = 200, success = true, errorCode = 0) {
        this.data = data;
        this.status = status;
        this.message = message;
        this.success = success;
    }
}
exports.HttpResponse = HttpResponse;
function prefix(basePath = '/') {
    return function (constructor) {
        const subRouter = new koa_swagger_decorator_1.SwaggerRouter();
        Object.getOwnPropertyNames(constructor).forEach(prop => {
            let handler = constructor[prop];
            if (handler.isRouterHandler) {
                let { method = 'get', path } = handler;
                path = path.replace(/\{(.*?)\}/g, (m, k) => k.startsWith('(') ? k : `:${k}`);
                handler.initSwaggerRequest(basePath);
                path = basePath === '/' ? path.replace(/^\//, '') : path;
                subRouter[method](path, handler);
            }
        });
        exports.rootRouter.use(basePath, subRouter.routes());
        return constructor;
    };
}
exports.prefix = prefix;
function requests(method, pathStr) {
    return function (target, name, descriptor) {
        let originFunction = descriptor.value;
        let dynamicNameFuncs = {
            [`${name}`]: async function (ctx) {
                let result;
                try {
                    ctx.status = 200;
                    if (typeof exports.RouterEvents.beforeController === 'function') {
                        await exports.RouterEvents.beforeController(ctx);
                    }
                    result = await originFunction(ctx);
                    if (typeof exports.RouterEvents.afterController === 'function') {
                        let afterResult = await exports.RouterEvents.afterController(ctx, result);
                        result = typeof afterResult !== 'undefined' ? afterResult : result;
                    }
                    if (typeof result !== 'undefined') {
                        let hasData = result && typeof result.data !== 'undefined';
                        ctx.status = result.status || ctx.status;
                        ctx.body = hasData ? result : {
                            data: result,
                            success: ctx.status >= 400 ? false : true,
                            status: ctx.status,
                            message: '',
                        };
                    }
                    return result;
                }
                catch (err) {
                    let message = err.message || '';
                    let status = err.status || 500;
                    let errorCode = err.code || ctx.state.errorCode || 0;
                    if (process.env.NODE_ENV !== 'production') {
                        message = err && err.message ? err.message : err;
                    }
                    ctx.status = status;
                    ctx.body = {
                        errorCode,
                        status: status,
                        message,
                        data: null,
                        success: false,
                    };
                }
            }
        };
        descriptor.value = dynamicNameFuncs[name];
        descriptor.value.method = method;
        descriptor.value.path = pathStr;
        descriptor.value.isRouterHandler = true;
        descriptor.value.initSwaggerRequest = (baseUrl = '') => {
            let fullpath = path.join(baseUrl, pathStr);
            let swaReqDecorator = koa_swagger_decorator_1.request(method, fullpath);
            swaReqDecorator(target, name, descriptor);
        };
        return descriptor;
    };
}
exports.requests = requests;
//# sourceMappingURL=decorators.js.map