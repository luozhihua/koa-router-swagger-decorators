"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("promise-events");
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
    return function (target) {
        const subRouter = new koa_swagger_decorator_1.SwaggerRouter();
        koa_swagger_decorator_1.prefix(basePath)(target);
        Object.getOwnPropertyNames(target).forEach(prop => {
            let handler = target[prop];
            if (handler.isRouterHandler) {
                let { method = 'get', path } = handler;
                path = path.replace(/\{(.*?)\}/g, (m, k) => k.startsWith('(') ? k : `:${k}`);
                handler.initSwaggerRequest(basePath);
                path = basePath === '/' ? path.replace(/^\//, '') : path;
                subRouter[method](path, handler);
            }
        });
        exports.rootRouter.use(basePath, subRouter.routes());
        return target;
    };
}
exports.prefix = prefix;
function wrapperProperty(target, descriptor, options = {}) {
    const { before, after, formatter } = options;
    const originFunction = descriptor.value;
    const NAME = originFunction.name;
    const EVENT_KEY = `${target.name}-${NAME}`;
    if (typeof originFunction !== 'function') {
        return descriptor.value;
    }
    target.decoratorEmitter = target.decoratorEmitter || new EventEmitter();
    let emitter = target.decoratorEmitter;
    if (typeof before === 'function') {
        emitter.setMaxListeners(emitter.getMaxListeners() + 1);
        emitter.on(`${EVENT_KEY}-before`, before);
    }
    if (typeof after === 'function') {
        emitter.setMaxListeners(emitter.getMaxListeners() + 1);
        emitter.on(`${EVENT_KEY}-after`, after);
    }
    if (!originFunction.wrappedDecorator) {
        const dynamicNameFuncs = {
            [`${NAME}`]: async function (ctx) {
                await emitter.emit(`${EVENT_KEY}-before`, ctx);
                let result = await originFunction(ctx);
                await emitter.emit(`${EVENT_KEY}-after`, ctx);
                result = typeof formatter === 'function' ? formatter(result) : result;
                ctx.status = 200;
                ctx.body = result;
                return result;
            }
        };
        dynamicNameFuncs[NAME].wrappedDecorator = true;
        Object.getOwnPropertyNames(originFunction).map((prop) => {
            if (!['name', 'length'].includes(prop)) {
                dynamicNameFuncs[NAME][prop] = originFunction[prop];
            }
        });
        let newFunc = dynamicNameFuncs[NAME];
        if (newFunc.name !== NAME) {
            throw new Error('[koa-router-swagger-decorators] - Decorator wrapper does not supported dynamic function name.');
        }
        descriptor.value = newFunc;
    }
}
exports.wrapperProperty = wrapperProperty;
function wrapperAll(target, options) {
    const { excludes = [] } = options;
    Object.getOwnPropertyNames(target)
        .filter(p => !['length', 'prototype', 'name', ...excludes].includes(p))
        .forEach(prop => {
        wrapperProperty(target, {
            value: target[prop],
            writable: true,
            enumerable: true,
        }, options);
    });
    Object.getOwnPropertyNames(target.prototype)
        .filter(p => !['constructor', ...excludes].includes(p))
        .forEach(prop => {
        wrapperProperty(target, { value: target.prototype[prop] }, options);
    });
}
exports.wrapperAll = wrapperAll;
function requests(method, pathStr) {
    return function (target, name, descriptor) {
        wrapperProperty(target, descriptor, {
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
        descriptor.value.method = method;
        descriptor.value.path = pathStr;
        descriptor.value.isRouterHandler = true;
        descriptor.value.initSwaggerRequest = (baseUrl = '') => {
        };
        koa_swagger_decorator_1.request(method, pathStr)(target, name, descriptor);
        return descriptor;
    };
}
exports.requests = requests;
//# sourceMappingURL=decorators.js.map