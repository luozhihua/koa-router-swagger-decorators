import * as path from 'path';
import * as EventEmitter from 'promise-events';
import { Context } from 'koa';
import { SwaggerRouter, request as swaggerRequest, prefix as swaggerPrefix } from 'koa-swagger-decorator';
import swagger from './swagger';

import { Config, ResponseData, AllowedMethods, defaultFormatter, } from './utils'

export const rootRouter = new SwaggerRouter();
export const RouterEvents: Pick<Config, 'beforeController' | 'afterController' | 'formatter'> = {};

/**
 * Create a root Router for Koa app;
 */
export function createRouter(config: Config) {
  RouterEvents.beforeController = config.beforeController;
  RouterEvents.afterController = config.afterController;
  RouterEvents.formatter = config.formatter;

  const router: any = swagger(config);

  rootRouter.use(router.routes());
  return rootRouter;
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
        path = basePath === '/' ? path.replace(/^\//, '') : path;
        subRouter[method](path, handler);
      }
    });

    rootRouter.use(basePath, subRouter.routes());

    return target;
  }
}

export interface DecoratorWrapperOptions {
  before? (ctx: Context): Promise<void>;
  after? (ctx: Context): Promise<any>;
  formatter? (ctx: Context, returnValue: any): any;
  excludes?: string[];
}
export function wrapperProperty(target: any, descriptor: PropertyDescriptor, options: Pick<DecoratorWrapperOptions, 'after' | 'before' | 'formatter'> = {}) {
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

  if (!originFunction.wrappedDecorator) {
    const dynamicNameFuncs: any = {
      [`${ NAME }`]: async function (ctx: Context) {
        await emitter.emit(`${ EVENT_KEY }-before`, ctx); // Before hooks
        let result: ResponseData = await originFunction(ctx);
        await emitter.emit(`${ EVENT_KEY }-after`, ctx); // After hooks

        ctx.status = 200;
        ctx.message = 'ok';

        // 避免使用此装饰器后的方法无法获取返回值。
        result = typeof formatter === 'function' ? formatter(ctx, result) : defaultFormatter(ctx, result);
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

    let newFunc = dynamicNameFuncs[NAME];

    if (newFunc.name !== NAME) {
      throw new Error('[koa-router-swagger-decorators] - Decorator wrapper does not supported dynamic function name.');
    }

    descriptor.value = newFunc;
  }
}

/**
 * 向指定类的所有 controller 注入 hook
 */
export function wrapperAll(target, options: DecoratorWrapperOptions) {
  const { excludes = [] } = options;

  Object.getOwnPropertyNames(target)
  .filter(p => !['length', 'prototype', 'name', ...excludes].includes(p))
  .forEach(prop => {
    wrapperProperty(target, { value: target[prop], }, options);
  });

  Object.getOwnPropertyNames(target.prototype)
  .filter(p => !['constructor', ...excludes].includes(p))
  .forEach(prop => {
    wrapperProperty(target, {value: target.prototype[prop]}, options);
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
    wrapperProperty(target, descriptor, {
      before: RouterEvents.beforeController,
      after: RouterEvents.afterController,
      formatter: RouterEvents.formatter,
    });

    descriptor.value.method = method;
    descriptor.value.path = pathStr;
    descriptor.value.isRouterHandler = true;
    swaggerRequest(method, pathStr)(target, name, descriptor);

    return descriptor;
  }
}
