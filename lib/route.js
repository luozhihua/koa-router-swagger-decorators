"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koa_swagger_decorator_1 = require("koa-swagger-decorator");
const utils_1 = require("./utils");
function formatter(formatter) {
    if (typeof formatter === "boolean" && formatter === false) {
        formatter = (ctx, res) => res || ctx.body;
    }
    return function (target, name, descriptor) {
        if (typeof formatter === "function") {
            descriptor.value.formatter = formatter;
        }
        return descriptor;
    };
}
exports.formatter = formatter;
function route(method, pathStr, render = false) {
    return function (target, name, descriptor) {
        const originFunction = descriptor.value;
        if (typeof originFunction !== "function") {
            return descriptor.value;
        }
        const NAME = originFunction.name;
        descriptor.value = utils_1.namedFunction(target, NAME, async (ctx, next) => {
            const formatter = descriptor.value.formatter;
            let result = await originFunction(ctx, next);
            result = render
                ? result
                : typeof formatter === "function"
                    ? formatter(ctx, result)
                    : utils_1.defaultFormatter(ctx, result);
            ctx.body = typeof result !== "undefined" ? result : ctx.body;
            ctx.status = result ? result.status || 200 : ctx.status;
            return ctx.body;
        });
        Object.getOwnPropertyNames(originFunction).map((prop) => {
            if (!["name", "length"].includes(prop)) {
                descriptor.value[prop] = originFunction[prop];
            }
        });
        descriptor.value.method = method;
        descriptor.value.path = pathStr;
        descriptor.value.isRouterHandler = true;
        koa_swagger_decorator_1.request(method, pathStr)(target, name, descriptor);
        return descriptor;
    };
}
exports.route = route;
//# sourceMappingURL=route.js.map