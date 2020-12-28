import {
  SwaggerRouter,
  request as swaggerRequest,
  prefix as swaggerPrefix,
  middlewares,
} from "koa-swagger-decorator";
import { RouterEvents } from "./decorators";
import {
  Config,
  ResponseData,
  AllowedMethods,
  defaultFormatter,
  ResponseFormatter,
  namedFunction,
  HttpStatusError,
} from "./utils";

/**
 * Koa Router request decorator
 *
 * @export
 * @param {AllowedMethods} method
 * @param {string} pathStr
 * @returns
 */
export function formatter(formatter: ResponseFormatter | boolean): any {
  // 如果 request 被装饰的函数有返回值则优先使用返回值，否则使用原始 ctx.body 的值；
  if (typeof formatter === "boolean" && formatter === false) {
    formatter = (ctx, res) => res || ctx.body;
  }

  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    if (typeof formatter === "function") {
      descriptor.value.formatter = formatter;
    }
    return descriptor;
  };
}

export function validate(validation: typeof RouterEvents.validation) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value.validation = validation;
    return descriptor;
  };
}

/**
 * Koa Router request decorator
 *
 * @export
 * @param {AllowedMethods} method
 * @param {string} pathStr
 * @returns
 */
export function route(
  method: AllowedMethods,
  pathStr: string,
  render: boolean = false
) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const originFunction = descriptor.value;
    if (typeof originFunction !== "function") {
      return descriptor.value;
    }

    const NAME = originFunction.name;
    descriptor.value = namedFunction(target, NAME, async (ctx, next) => {
      const formatter = descriptor.value.formatter;
      const validation: typeof RouterEvents.validation =
        descriptor.value.validation || RouterEvents.validation;

      // 参数验证
      if (validation) {
        const errors = await validation(ctx, target, NAME);
        if (errors) {
          throw new HttpStatusError(400, JSON.stringify(errors, null, 4));
        }
      }

      let result: ResponseData = await originFunction(ctx, next);
      result = render
        ? result
        : typeof formatter === "function"
        ? formatter(ctx, result)
        : defaultFormatter(ctx, result);

      // 如果 Formatter和控制器都没有返回任何数值，则使用 ctx.body的值
      // 优先使用返回值，其次是 ctx.body;
      ctx.body = typeof result !== "undefined" ? result : ctx.body;
      // ctx.status = render
      //   ? ctx.status
      //   : result
      //   ? result.status || 200
      //   : ctx.status;

      // 避免使用此装饰器后的方法无法获取返回值。
      return ctx.body;
    });

    // 将被装饰函数或方法的原属性拷贝到新函数或方法，
    // 避免丢失@query, @path, @body, @formData 等其他装饰器元数据
    Object.getOwnPropertyNames(originFunction).map((prop: string) => {
      if (!["name", "length"].includes(prop)) {
        descriptor.value[prop] = originFunction[prop];
      }
    });
    descriptor.value.method = method;
    descriptor.value.path = pathStr;
    descriptor.value.isRouterHandler = true;
    swaggerRequest(method, pathStr)(target, name, descriptor);
    return descriptor;
  };
}
