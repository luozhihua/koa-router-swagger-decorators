import * as path from 'path';
import { Context } from 'koa';
import { SwaggerRouter, request as swaggerRequest } from 'koa-swagger-decorator';
import swagger from './swagger';

export interface SwaggerConfig {}

export interface Config {
  controllersDir: string;
  packageFile: string;
  swaggerConfig?: SwaggerConfig;
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

/**
 *
 */
export function createRouter(config: Config) {
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
    let originValue = descriptor.value
    let dynamicNameFuncs: any = {
      [`${name}`]: async function (ctx: Context) {
        let result = await originValue(ctx);

        if (typeof result !== 'undefined') {
          let hasData = result && typeof result.data !== 'undefined';
          ctx.body = hasData ? result : {
            code: 0,
            data: result,
            success: true,
          }
        }

        // 避免使用此装饰器后的方法无法获取返回值。
        return result;
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
