"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = exports.validate = exports.formatter = void 0;
const koa_swagger_decorator_1 = require("koa-swagger-decorator");
const decorators_1 = require("./decorators");
const utils_1 = require("./utils");
const config_1 = require("./config");
const validator_1 = __importDefault(require("./validator"));
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
function validate(validation) {
    return function (target, name, descriptor) {
        descriptor.value.validation = validation;
        return descriptor;
    };
}
exports.validate = validate;
async function doValidate(ctx, target, descriptor, NAME) {
    const validations = [
        descriptor.value.validation,
        decorators_1.RouterEvents.validation || validator_1.default,
    ];
    const errorList = await Promise.all(validations.map(async (validation) => {
        if (validation) {
            return await validation(ctx, target, NAME);
        }
        else {
            return Promise.resolve(null);
        }
    }));
    const errors = errorList.filter((e) => e !== null);
    let errorsCount = 0;
    const flattenErrors = {};
    function flat(errs) {
        errs.forEach((err) => {
            if (Array.isArray(err)) {
                flat(err);
            }
            else {
                flattenErrors[err.paramsType] = flattenErrors[err.paramsType] || [];
                flattenErrors[err.paramsType].push(err);
                errorsCount += 1;
            }
        });
    }
    flat(errors);
    if (errorsCount > 0) {
        ctx.status = 400;
        throw new utils_1.HttpStatusError(400, "Request validate failed.", flattenErrors);
    }
}
function route(method, pathStr, render = false) {
    return function (target, name, descriptor) {
        const originFunction = descriptor.value;
        if (typeof originFunction !== "function") {
            return descriptor.value;
        }
        const NAME = originFunction.name;
        descriptor.value = utils_1.namedFunction(target, NAME, async (ctx, next) => {
            const formatter = descriptor.value.formatter;
            ctx.status = 200;
            if (config_1.config.validatable) {
                await doValidate(ctx, target, descriptor, NAME);
            }
            let result = await originFunction(ctx, next);
            result = render
                ? result
                : typeof formatter === "function"
                    ? formatter(ctx, result)
                    : utils_1.defaultFormatter(ctx, result);
            ctx.body = typeof result !== "undefined" ? result : ctx.body;
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