import { Context } from "koa";

export type AllowedMethods =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "option";
export const GET: AllowedMethods = "get";
export const POST: AllowedMethods = "post";
export const DELETE: AllowedMethods = "delete";
export const PUT: AllowedMethods = "put";
export const PATCH: AllowedMethods = "patch";
export const OPTION: AllowedMethods = "option";

export interface SwaggerConfig {}

export type ResponseFormatter = (ctx: Context, result: any) => any;
export interface Config {
  controllersDir: string;
  packageFile: string;
  swaggerConfig?: SwaggerConfig;

  /**
   * 是否自动扫描 controllerDir 所指定目录的子目录; default: true;
   */
  recursive?: boolean;

  /**
   * 是否自动验证请求的 body/query/params;
   * 如果验证不通过则会返回 400 Bad request;
   * default: true
   */
  validatable?: boolean;
  validation?: <T = boolean>(
    ctx: Context,
    target: any,
    name: string
  ) => Promise<T>;
  beforeController?: (ctx: Context, target: any, name: string) => Promise<any>;
  afterController?: (ctx: Context, target: any, name: string) => Promise<any>;
  formatter?: ResponseFormatter;
}

export interface ResponseData {
  status: number;
  message: string;
  success: boolean;
  data: any;
}

export interface KoaRouterConfig {
  controllersDir: string;
  packageFile: string;
  swaggerConfig?: SwaggerConfig;
}

/**
 * 指定 Http 状态码的异常类
 */
export class HttpStatusError extends Error {
  public status: number;
  public errors: any;

  constructor(status: number, message: string, errors?: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}

export class HttpResponse {
  public data: any;
  public status?: number = 200;
  public message?: string = "";
  public success?: boolean = true;
  public errorCode?: number | string = 0;
  public errors?: any;
  public noWrapper?: boolean = false;

  constructor(
    options: Pick<
      HttpResponse,
      | "data"
      | "status"
      | "errors"
      | "errorCode"
      | "message"
      | "success"
      | "noWrapper"
    >
  ) {
    let {
      data,
      message = "",
      status = 200,
      success = true,
      errors = null,
      noWrapper = false,
    } = options;

    this.data = data;
    this.status = status;
    this.message = message;
    this.errors = errors;
    this.success = success;
    this.noWrapper = noWrapper;
  }
}

export const defaultFormatter: ResponseFormatter = (
  ctx: Context,
  result: any
): any => {
  if (result instanceof HttpResponse) {
    return result;
  } else {
    return new HttpResponse({
      data: result || ctx.body || null,
      message: ctx.message || ctx.state.message || "",
      status: ctx.status,
      success: true,
    });
  }

  // if (
  //   result &&
  //   typeof result.data === "undefined" &&
  //   typeof result.success === "undefined"
  // ) {
  //   ctx.status = result ? result.status || ctx.status : 200;

  //   return new HttpResponse({
  //     data: result,
  //     message: ctx.message || ctx.state.message || "",
  //     status: 200,
  //     errorCode: ctx.state.errorCode || 0,
  //     success: true,
  //   });
  // } else if (!result) {
  //   ctx.status = 200;
  //   return new HttpResponse({
  //     data: ctx.body || null,
  //     message: ctx.message || ctx.state.message || "",
  //     status: 200,
  //     errorCode: ctx.state.errorCode || 0,
  //     success: true,
  //   });
  // } else {
  //   ctx.status = result.status || ctx.status || 200;
  //   return result;
  // }
};

/**
 * 将匿名函数转为具名函数
 *
 * @param funcName 函数名称
 * @param func 匿名函数或具名函数
 * @param target 函数执行时要附加到的对象
 */
export function namedFunction(target, funcName, func) {
  const dynamicNameFuncs = {
    [`${funcName}`]: function (...params) {
      return func.apply(target || null, params);
    },
  };
  const newFunc = dynamicNameFuncs[funcName];

  if (newFunc.name !== funcName) {
    throw new Error(
      "[koa-router-swagger-decorators] - Decorator wrapper does not supported dynamic function name."
    );
  }

  return newFunc;
}
