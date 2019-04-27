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
function createRouter(config) {
    const router = swagger_1.default(config);
    exports.rootRouter.use(router.routes());
    return exports.rootRouter;
}
exports.createRouter = createRouter;
function prefix(basePath = '/') {
    return function (constructor) {
        const subRouter = new koa_swagger_decorator_1.SwaggerRouter();
        Object.getOwnPropertyNames(constructor).forEach(prop => {
            let handler = constructor[prop];
            if (handler.isRouterHandler) {
                let { method = 'get', path } = handler;
                path = path.replace(/\{([\w\d]+)\}/g, (matched, key) => {
                    return `:${key}`;
                });
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
        let originValue = descriptor.value;
        let dynamicNameFuncs = {
            [`${name}`]: async function (ctx) {
                let result = await originValue(ctx);
                let hasData = result && typeof result.data !== 'undefined';
                ctx.body = hasData ? result : {
                    code: 0,
                    data: result,
                    success: true,
                };
                return result;
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