import * as path from 'path';
import { Context } from 'koa';
import { SwaggerRouter, request as swaggerRequest } from 'koa-swagger-decorator';
import swagger from './swagger';

export interface SwaggerConfig {}

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
  beforeController?: (ctx: Context) => Promise<any>;
  afterController?: (ctx: Context, result: any) => any;
}

export interface ResponseData {
  status: number;
  message: string;
  success: boolean;
  data: any;
  errorCode?: number;
}

export interface KoaRouterConfig {
  controllersDir: string;
  packageFile: string;
  swaggerConfig?: SwaggerConfig;
}

export type AllowedMethods = 'get' | 'post' | 'put' | 'delete' |  'patch' | 'option';
export const GET: AllowedMethods = 'get';
export const POST: AllowedMethods = 'post';
export const DELETE: AllowedMethods = 'delete';
export const PUT: AllowedMethods = 'put';
export const PATCH: AllowedMethods = 'patch';
export const OPTION: AllowedMethods = 'option';
export const rootRouter = new SwaggerRouter();
export const RouterEvents: Pick<Config, 'beforeController' | 'afterController'> = {};

/**
 * Create a root Router for Koa app;
 */
export function createRouter(config: Config) {
  RouterEvents.beforeController = config.beforeController;
  RouterEvents.afterController = config.afterController;

  const router: any = swagger(config);

  rootRouter.use(router.routes());
  return rootRouter;
}

/**
 * 指定 Http 状态码的异常类
 */
export class HttpStatusError extends Error {
  public status: number;
  public errorCode: number;

  constructor(status: number, message: string, errorCode?: number) {
    super(message);
    this.status = status;
    this.errorCode = errorCode || 0;
  }
}

/**
 * Koa Router router decorator
 *
 * @export
 * @param {string} [basePath='/']
 * @returns
 */
export function prefix(basePath: string = '/') {
  return function <T extends {new(...args: any[]): {}}>(constructor: T) {
    const subRouter = new SwaggerRouter();

    Object.getOwnPropertyNames(constructor).forEach(prop => {
      let handler = constructor[prop]

      if (handler.isRouterHandler) {
        let {method = 'get', path} = handler;

        path = path.replace(/\{(.*?)\}/g, (m, k) => k.startsWith('(') ? k : `:${k}`);

        handler.initSwaggerRequest(basePath);

        path = basePath === '/' ? path.replace(/^\//, '') : path;
        subRouter[method](path, handler);
      }
    })

    rootRouter.use(basePath, subRouter.routes());

    return constructor;
  }
}

/**
 * Koa Router request decorator
 *
 * @export
 * @param {AllowedMethods} method
 * @param {string} pathStr
 * @returns
 */
export function requests(method: AllowedMethods, pathStr: string) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    let originFunction = descriptor.value
    let dynamicNameFuncs: any = {
      [`${name}`]: async function (ctx: Context) {

        let result: ResponseData;
        try {
          // 进入此方法的时候，表明请求的 URL 已存在,
          // 在对应的 request controller 中，或者 beforeController/afterController中 可以改变这个状态；
          ctx.status = 200;

          // Before hooks
          if (typeof RouterEvents.beforeController === 'function') {
            await RouterEvents.beforeController(ctx);
          }

          // Route controller
          result = await originFunction(ctx);

          // After hooks
          if (typeof RouterEvents.afterController === 'function') {
            let afterResult = await RouterEvents.afterController(ctx, result);

            result = typeof afterResult !== 'undefined' ? afterResult : result;
          }

          if (typeof result !== 'undefined') {
            let hasData = result && typeof result.data !== 'undefined';
            ctx.body = hasData ? result : {
              data: result,
              success: ctx.status >= 400 ? false : true,
              status: ctx.status,
              message: '',
            }
          }

          // 避免使用此装饰器后的方法无法获取返回值。
          return result;
        } catch (err) {
          let message = err.message || '';
          let status = err.status || 500;
          let errorCode = err.code || ctx.state.errorCode || 0;

          if (process.env.NODE_ENV !== 'production') {
            message = err && err.message ? err.message : err;
          }

          ctx.status = status;
          ctx.body = {
            errorCode,
            status: status,
            message,
            data: null,
            success: false,
          }
        }
      }
    };

    descriptor.value = dynamicNameFuncs[name];
    descriptor.value.method = method;
    descriptor.value.path = pathStr;
    descriptor.value.isRouterHandler = true;
    descriptor.value.initSwaggerRequest = (baseUrl = '') => {
      let fullpath = path.join(baseUrl, pathStr);
      let swaReqDecorator = swaggerRequest(method, fullpath);

      swaReqDecorator(target, name, descriptor);
    };

    return descriptor;
  }
}
