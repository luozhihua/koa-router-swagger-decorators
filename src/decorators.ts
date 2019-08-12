import * as path from 'path';
import * as EventEmitter from 'promise-events';
import { Context } from 'koa';
import { SwaggerRouter, request as swaggerRequest, prefix as swaggerPrefix } from 'koa-swagger-decorator';
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
  afterController?: (ctx: Context) => any;
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

export class HttpResponse {
  public data: any;
  public status?: number = 200;
  public message?: string = '';
  public success?: boolean = true;
  public errorCode?: number = 0;

  constructor(options: Pick<HttpResponse, 'data' | 'status' | 'errorCode' | 'message' | 'success'>) {
    let { data, message = '', status = 200, success = true, errorCode = 0} = options;

    this.data = data;
    this.status = status;
    this.message = message;
    this.success = success;
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
  return function (target: any) {
    const subRouter = new SwaggerRouter();

    swaggerPrefix(basePath)(target);

    Object.getOwnPropertyNames(target).forEach(prop => {
      let handler = target[prop]

      if (handler.isRouterHandler) {
        let {method = 'get', path} = handler;

        path = path.replace(/\{(.*?)\}/g, (m, k) => k.startsWith('(') ? k : `:${k}`);

        handler.initSwaggerRequest(basePath);

        path = basePath === '/' ? path.replace(/^\//, '') : path;
        subRouter[method](path, handler);
      }
    })

    rootRouter.use(basePath, subRouter.routes());

    return target;
  }
}

export interface DecoratorWrapperOptions {
  before? (ctx: Context): Promise<void>;
  after? (ctx: Context): Promise<any>;
  formatter? (returnValue: any): any;
  excludes?: string[];
}
export function wrapperProperty(target: any, descriptor: PropertyDescriptor, options: Pick<DecoratorWrapperOptions, 'after' | 'before' | 'formatter'> = {}): PropertyDescriptor {
  const { before, after, formatter} = options;
  const originFunction = descriptor.value;
  const NAME = originFunction.name;
  const EVENT_KEY = `${ target.name }-${ NAME }`;

  if (typeof originFunction !== 'function') {
    return descriptor.value;
  }

  target.decoratorEmitter = target.decoratorEmitter || new EventEmitter();
  let emitter = target.decoratorEmitter;

  if (typeof before === 'function') {
    emitter.setMaxListeners(emitter.getMaxListeners() + 1);
    emitter.on(`${ EVENT_KEY }-before`, before);
  }

  if (typeof after === 'function') {
    emitter.setMaxListeners(emitter.getMaxListeners() + 1);
    emitter.on(`${ EVENT_KEY }-after`, after);
  }

  if (originFunction.wrappedDecorator) {
    console.log(EVENT_KEY);
    return originFunction;
  } else {
    const dynamicNameFuncs: any = {
      [`${ NAME }`]: async function (ctx: Context) {
        await emitter.emit(`${ EVENT_KEY }-before`, ctx); // Before hooks
        let result: ResponseData = await originFunction(ctx);
        await emitter.emit(`${ EVENT_KEY }-after`, ctx); // After hooks

        // 避免使用此装饰器后的方法无法获取返回值。
        result = typeof formatter === 'function' ? formatter(result) : result;

        ctx.status = 200;
        ctx.body = result;

        return result;
      }
    };

    dynamicNameFuncs[NAME].wrappedDecorator = true;
    Object.getOwnPropertyNames(originFunction).map((prop: string) => {
      if (!['name', 'length'].includes(prop)) {
        dynamicNameFuncs[NAME][prop] = originFunction[prop];
      }
    });

    return dynamicNameFuncs[NAME];
  }
}

export function wrapperAll(target, options: DecoratorWrapperOptions) {
  const { excludes = [] } = options;

  Object.getOwnPropertyNames(target)
  .filter(p => !['length', 'prototype', 'name', ...excludes].includes(p))
  .forEach(prop => {
    target[prop] = wrapperProperty(target, {
      value: target[prop],
      writable: true,
      enumerable: true,
    }, options);
  });

  Object.getOwnPropertyNames(target.prototype)
  .filter(p => !['constructor', ...excludes].includes(p))
  .forEach(prop => {
    target.prototype[prop] = wrapperProperty(target, {value: target.prototype[prop]}, options);
  });
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
    let decorator = wrapperProperty(target, descriptor, {
      before: RouterEvents.beforeController,
      after: RouterEvents.afterController,
      formatter(result) {
        if (typeof result !== 'undefined') {
          let hasData = result && typeof result.data !== 'undefined';

          return hasData ? result : {
            data: result,
            success: true,
            status: 200,
            message: '',
          }
        }
      }
    });

    descriptor.value = decorator;
    descriptor.value.method = method;
    descriptor.value.path = pathStr;
    descriptor.value.isRouterHandler = true;
    descriptor.value.initSwaggerRequest = (baseUrl = '') => {
      // let fullpath = path.join(baseUrl, pathStr);
      // let swaReqDecorator = swaggerRequest(method, fullpath);

      // swaReqDecorator(target, name, descriptor);
    };


    swaggerRequest(method, pathStr)(target, name, descriptor);

    return descriptor;
  }
}
