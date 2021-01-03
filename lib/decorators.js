"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requests = exports.wrapperAll = exports.wrapperProperty = exports.prefix = exports.createRouter = exports.RouterEvents = exports.rootRouter = void 0;
const EventEmitter = require("promise-events");
const merge = require("merge");
const koa_swagger_decorator_1 = require("koa-swagger-decorator");
const swagger_1 = require("./swagger");
const utils_1 = require("./utils");
const config_1 = require("./config");
exports.rootRouter = new koa_swagger_decorator_1.SwaggerRouter();
exports.RouterEvents = {};
function createRouter(options) {
    exports.RouterEvents.beforeController = options.beforeController;
    exports.RouterEvents.afterController = options.afterController;
    exports.RouterEvents.formatter = options.formatter;
    exports.RouterEvents.validation = options.validation;
    merge(config_1.config, options);
    const router = swagger_1.default(options);
    exports.rootRouter.use(router.routes());
    return exports.rootRouter;
}
exports.createRouter = createRouter;
function prefix(basePath = "/") {
    return function (target) {
        const subRouter = new koa_swagger_decorator_1.SwaggerRouter();
        koa_swagger_decorator_1.prefix(basePath)(target);
        Object.getOwnPropertyNames(target).forEach((prop) => {
            let handler = target[prop];
            if (handler.isRouterHandler) {
                let { method = "get", path } = handler;
                path = path.replace(/\{(.*?)\}/g, (m, k) => k.startsWith("(") ? k : `:${k}`);
                path = basePath === "/" ? path.replace(/^\//, "") : path;
                subRouter[method](path, handler);
            }
        });
        exports.rootRouter.use(basePath, subRouter.routes());
        return target;
    };
}
exports.prefix = prefix;
function wrapperProperty(target, descriptor, options = {}) {
    console.warn("[koa-router-swagger-decorators] - Deprecated， Starting from version 4.0, the wrapperProperty method will be deprecated and no longer recommended");
    const { formatter } = options;
    const originFunction = descriptor.value;
    const NAME = originFunction.name;
    const EVENT_KEY = `${target.name}-${NAME}`;
    if (typeof originFunction !== "function") {
        return descriptor.value;
    }
    target.decoratorEmitter = target.decoratorEmitter || new EventEmitter();
    let emitter = target.decoratorEmitter;
    ["before", "beforeFirst", "after", "afterLast"].forEach((evt) => {
        if (typeof options[evt] === "function") {
            emitter.setMaxListeners(emitter.getMaxListeners() + 1);
            emitter.on(`${EVENT_KEY}-${evt}`, options[evt]);
        }
    });
    if (!originFunction.wrappedDecorator) {
        const dynamicNameFuncs = {
            [`${NAME}`]: async function (ctx) {
                ctx.status = 200;
                ctx.message = "ok";
                await emitter.emit(`${EVENT_KEY}-beforeFirst`, ctx, target, NAME);
                await emitter.emit(`${EVENT_KEY}-before`, ctx, target, NAME);
                let result = await originFunction(ctx);
                await emitter.emit(`${EVENT_KEY}-after`, ctx, target, NAME);
                await emitter.emit(`${EVENT_KEY}-afterLast`, ctx, target, NAME);
                const formatter = descriptor.value.formatter;
                result =
                    typeof formatter === "function"
                        ? formatter(ctx, result)
                        : utils_1.defaultFormatter(ctx, result);
                ctx.body = typeof result !== "undefined" ? result : ctx.body;
                ctx.status = result.status || ctx.status;
                return ctx.body;
            },
        };
        dynamicNameFuncs[NAME].wrappedDecorator = true;
        descriptor.value.formatter =
            options.formatter || descriptor.value.formatter;
        Object.getOwnPropertyNames(originFunction).map((prop) => {
            if (!["name", "length"].includes(prop)) {
                dynamicNameFuncs[NAME][prop] = originFunction[prop];
            }
        });
        const newFunc = dynamicNameFuncs[NAME];
        if (newFunc.name !== NAME) {
            throw new Error("[koa-router-swagger-decorators] - Decorator wrapper does not supported dynamic function name.");
        }
        descriptor.value = newFunc;
    }
}
exports.wrapperProperty = wrapperProperty;
function wrapperAll(target, options) {
    console.warn("[koa-router-swagger-decorators] - Deprecated， Starting from version 4.0, the wrapperAll method will be deprecated and no longer recommended");
    const { excludes = [] } = options;
    Object.getOwnPropertyNames(target)
        .filter((p) => !["length", "prototype", "name", ...excludes].includes(p))
        .forEach((prop) => {
        wrapperProperty(target, { value: target[prop] }, options);
    });
    Object.getOwnPropertyNames(target.prototype)
        .filter((p) => !["constructor", ...excludes].includes(p))
        .forEach((prop) => {
        wrapperProperty(target, { value: target.prototype[prop] }, options);
    });
}
exports.wrapperAll = wrapperAll;
function requests(method, pathStr, formatter) {
    console.warn("[koa-router-swagger-decorators] - Deprecated， Starting from version 4.0, the requests method will be deprecated and no longer recommended");
    if (typeof formatter === "boolean") {
        formatter = (ctx, res) => res || ctx.body;
    }
    return function (target, name, descriptor) {
        wrapperProperty(target, descriptor, {
            beforeFirst: exports.RouterEvents.beforeController,
            afterLast: exports.RouterEvents.afterController,
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