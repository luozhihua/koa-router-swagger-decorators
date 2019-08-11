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
function createDecoratorWrapper(descriptor, { before, after, formatter }) {
    const originFunction = descriptor.value;
    const NAME = originFunction.name;
    const dynamicNameFuncs = {
        [`${NAME}`]: async function (ctx) {
            if (typeof before === 'function') {
                await before(ctx);
            }
            let result = await originFunction(ctx);
            if (typeof after === 'function') {
                let afterResult = await after(ctx, result);
                result = typeof afterResult !== 'undefined' ? afterResult : result;
            }
            let formattedResult = typeof formatter === 'function' ? formatter(result) : result;
            ctx.status = 200;
            ctx.body = formattedResult;
            return formattedResult;
        }
    };
    Object.getOwnPropertyNames(originFunction).map((prop) => {
        if (!['name', 'length'].includes(prop)) {
            dynamicNameFuncs[NAME][prop] = originFunction[prop];
        }
    });
    return dynamicNameFuncs[NAME];
}
exports.createDecoratorWrapper = createDecoratorWrapper;
function requests(method, pathStr) {
    return function (target, name, descriptor) {
        let decorator = createDecoratorWrapper(descriptor, {
            before: exports.RouterEvents.beforeController,
            after: exports.RouterEvents.afterController,
            formatter(result) {
                if (typeof result !== 'undefined') {
                    let hasData = result && typeof result.data !== 'undefined';
                    return hasData ? result : {
                        data: result,
                        success: true,
                        status: 200,
                        message: '',
                    };
                }
            }
        });
        descriptor.value = decorator;
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