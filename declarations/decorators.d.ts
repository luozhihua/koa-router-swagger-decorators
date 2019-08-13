import { Context } from 'koa';
import { SwaggerRouter } from 'koa-swagger-decorator';
import { Config, AllowedMethods } from './utils';
export declare const rootRouter: SwaggerRouter;
export declare const RouterEvents: Pick<Config, 'beforeController' | 'afterController' | 'formatter'>;
export declare function createRouter(config: Config): SwaggerRouter;
export declare function prefix(basePath?: string): (target: any) => any;
export interface DecoratorWrapperOptions {
    before?(ctx: Context): Promise<void>;
    after?(ctx: Context): Promise<any>;
    formatter?(ctx: Context, returnValue: any): any;
    excludes?: string[];
}
export declare function wrapperProperty(target: any, descriptor: PropertyDescriptor, options?: Pick<DecoratorWrapperOptions, 'after' | 'before' | 'formatter'>): any;
export declare function wrapperAll(target: any, options: DecoratorWrapperOptions): void;
export declare function requests(method: AllowedMethods, pathStr: string): (target: any, name: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
