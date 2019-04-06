// import { BasePath } from '@decorators';
import { Context } from 'koa';
import * as KoaRouter from 'koa-router';
import * as path from 'path';
import { request as swaggerRequest } from 'koa-swagger-decorator';

export type AllowedMethods = 'get' | 'post' | 'put' | 'delete' |  'patch' | 'option';
export const GET: AllowedMethods = 'get';
export const POST: AllowedMethods = 'post';
export const DELETE: AllowedMethods = 'delete';
export const PUT: AllowedMethods = 'put';
export const PATCH: AllowedMethods = 'patch';
export const OPTION: AllowedMethods = 'option';
export const rootRouter = new KoaRouter();
export function router(basePath: string = '/') {
  return function <T extends {new(...args: any[]): {}}>(constructor: T) {
    const subRouter = new KoaRouter()

    Object.getOwnPropertyNames(constructor).forEach(prop => {
      let handler = constructor[prop]

      if (handler.isRouterHandler) {
        let {method = 'get', path} = handler;

        path = path.replace(/\{([\w\d]+)\}/g, (matched, key) => {
          return `:${key}`
        })

        handler.initSwaggerRequest(basePath);
        subRouter[method](path, handler);
      }
    })

    rootRouter.use(basePath, subRouter.routes());

    return constructor;
  }
}

/**
 *
 * @param method
 * @param pathStr
 */
export function requests(method: AllowedMethods, pathStr: string) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    let originValue = descriptor.value

    async function handler (ctx: Context) {
      let result = await originValue(ctx);
      let hasData = result && typeof result.data !== 'undefined';

      ctx.body = hasData ? result : {
        code: 0,
        data: result,
        success: true,
      }
    }

    descriptor.value = handler;
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
