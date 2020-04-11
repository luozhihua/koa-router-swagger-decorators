import * as path from 'path';
import * as EventEmitter from 'promise-events';
import { Context } from 'koa';
import { SwaggerRouter, request as swaggerRequest, prefix as swaggerPrefix } from 'koa-swagger-decorator';
import swagger from './swagger';

import { Config, ResponseData, AllowedMethods, defaultFormatter, ResponseFormatter, } from './utils'

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
  before? (ctx: Context, target: any, name: string): Promise<void>;
  after? (ctx: Context, target: any, name: string): Promise<any>;
  beforeFirst? (ctx: Context, target: any, name: string): Promise<void>;
  afterLast? (ctx: Context, target: any, name: string): Promise<any>;
  formatter?: ResponseFormatter;
}
export function wrapperProperty(target: any, descriptor: PropertyDescriptor, options: DecoratorWrapperOptions = {}) {
  const { before, after, formatter} = options;
  const originFunction = descriptor.value;
  const NAME = originFunction.name;
  const EVENT_KEY = `${ target.name }-${ NAME }`;

  if (typeof originFunction !== 'function') {
    return descriptor.value;
  }

  target.decoratorEmitter = target.decoratorEmitter || new EventEmitter();
  let emitter = target.decoratorEmitter;

  ['before', 'beforeFirst', 'after', 'afterLast'].forEach(evt => {
    if (typeof options[evt] === 'function') {
      emitter.setMaxListeners(emitter.getMaxListeners() + 1);
      emitter.on(`${ EVENT_KEY }-${evt}`, before);
    }
  });

  if (!originFunction.wrappedDecorator) {

    // 使用 dynamicNameFuncs[`${NAME}`]的目的是动态生成具名函数
    // 匿名函数会导致同类的子装饰器失效
    const dynamicNameFuncs: any = {
      [`${ NAME }`]: async function (ctx: Context) {

        ctx.status = 200;
        ctx.message = 'ok';

        await emitter.emit(`${ EVENT_KEY }-beforeFirst`, ctx, target, NAME); // Before hooks
        await emitter.emit(`${ EVENT_KEY }-before`, ctx, target, NAME); // Before hooks
        let result: ResponseData = await originFunction(ctx);
        await emitter.emit(`${ EVENT_KEY }-after`, ctx, target, NAME); // After hooks
        await emitter.emit(`${ EVENT_KEY }-afterLast`, ctx, target, NAME); // After hooks
        result = typeof formatter === 'function' ? formatter(ctx, result) : defaultFormatter(ctx, result);

        // 如果 Formatter和控制器都没有返回任何数值，则使用 ctx.body的值
        // 优先使用返回值，其次是 ctx.body;
        ctx.body = typeof result !== 'undefined' ? result : ctx.body;

        // 避免使用此装饰器后的方法无法获取返回值。
        return ctx.body;
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
export function wrapperAll(target, options: DecoratorWrapperOptions & { excludes?: string[]}) {
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
export function requests(method: AllowedMethods, pathStr: string, formatter?: ResponseFormatter | boolean) {

  // 如果 request 被装饰的函数有返回值则优先使用返回值，否则使用原始 ctx.body 的值；
  if (typeof formatter === 'boolean') {
    formatter = (ctx, res) => res || ctx.body;
  }

  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    wrapperProperty(target, descriptor, {
      beforeFirst: RouterEvents.beforeController,
      afterLast: RouterEvents.afterController,
      formatter: formatter as ResponseFormatter || RouterEvents.formatter,
    });

    descriptor.value.method = method;
    descriptor.value.path = pathStr;
    descriptor.value.isRouterHandler = true;
    swaggerRequest(method, pathStr)(target, name, descriptor);

    return descriptor;
  }
}
