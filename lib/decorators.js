"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("promise-events");
const koa_swagger_decorator_1 = require("koa-swagger-decorator");
const swagger_1 = require("./swagger");
const utils_1 = require("./utils");
exports.rootRouter = new koa_swagger_decorator_1.SwaggerRouter();
exports.RouterEvents = {};
function createRouter(config) {
    exports.RouterEvents.beforeController = config.beforeController;
    exports.RouterEvents.afterController = config.afterController;
    exports.RouterEvents.formatter = config.formatter;
    const router = swagger_1.default(config);
    exports.rootRouter.use(router.routes());
    return exports.rootRouter;
}
exports.createRouter = createRouter;
function prefix(basePath = '/') {
    return function (target) {
        const subRouter = new koa_swagger_decorator_1.SwaggerRouter();
        koa_swagger_decorator_1.prefix(basePath)(target);
        Object.getOwnPropertyNames(target).forEach(prop => {
            let handler = target[prop];
            if (handler.isRouterHandler) {
                let { method = 'get', path } = handler;
                path = path.replace(/\{(.*?)\}/g, (m, k) => k.startsWith('(') ? k : `:${k}`);
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
                ctx.status = 200;
                ctx.message = 'ok';
                await emitter.emit(`${EVENT_KEY}-before`, ctx, target, NAME);
                let result = await originFunction(ctx);
                await emitter.emit(`${EVENT_KEY}-after`, ctx, target, NAME);
                result = typeof formatter === 'function' ? formatter(ctx, result) : utils_1.defaultFormatter(ctx, result);
                ctx.body = typeof result !== 'undefined' ? result : ctx.body;
                return ctx.body;
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
        wrapperProperty(target, { value: target[prop], }, options);
    });
    Object.getOwnPropertyNames(target.prototype)
        .filter(p => !['constructor', ...excludes].includes(p))
        .forEach(prop => {
        wrapperProperty(target, { value: target.prototype[prop] }, options);
    });
}
exports.wrapperAll = wrapperAll;
function requests(method, pathStr, formatter) {
    if (typeof formatter === 'boolean') {
        formatter = (ctx, res) => res || ctx.body;
    }
    return function (target, name, descriptor) {
        wrapperProperty(target, descriptor, {
            before: exports.RouterEvents.beforeController,
            after: exports.RouterEvents.afterController,
            formatter: formatter || exports.RouterEvents.formatter,
        });
        descriptor.value.method = method;
        descriptor.value.path = pathStr;
        descriptor.value.isRouterHandler = true;
        koa_swagger_decorator_1.request(method, pathStr)(target, name, descriptor);
        return descriptor;
    };
}
exports.requests = requests;
//# sourceMappingURL=decorators.js.map