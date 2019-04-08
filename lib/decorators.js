"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const KoaRouter = require("koa-router");
const koa_swagger_decorator_1 = require("koa-swagger-decorator");
exports.GET = 'get';
exports.POST = 'post';
exports.DELETE = 'delete';
exports.PUT = 'put';
exports.PATCH = 'patch';
exports.OPTION = 'option';
exports.rootRouter = new KoaRouter();
function router(basePath = '/') {
    return function (constructor) {
        const subRouter = new KoaRouter();
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
exports.router = router;
function requests(method, pathStr) {
    return function (target, name, descriptor) {
        let originValue = descriptor.value;
        async function handler(ctx) {
            let result = await originValue(ctx);
            let hasData = result && typeof result.data !== 'undefined';
            ctx.body = hasData ? result : {
                code: 0,
                data: result,
                success: true,
            };
        }
        descriptor.value = handler;
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