import { Context } from 'koa';
import { SwaggerRouter } from 'koa-swagger-decorator';
export interface SwaggerConfig {
}
export interface Config {
    controllersDir: string;
    packageFile: string;
    swaggerConfig?: SwaggerConfig;
    recursive?: boolean;
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
export declare type AllowedMethods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'option';
export declare const GET: AllowedMethods;
export declare const POST: AllowedMethods;
export declare const DELETE: AllowedMethods;
export declare const PUT: AllowedMethods;
export declare const PATCH: AllowedMethods;
export declare const OPTION: AllowedMethods;
export declare const rootRouter: SwaggerRouter;
export declare const RouterEvents: Pick<Config, 'beforeController' | 'afterController'>;
export declare function createRouter(config: Config): SwaggerRouter;
export declare class HttpStatusError extends Error {
    status: number;
    errorCode: number;
    constructor(status: number, message: string, errorCode?: number);
}
export declare class HttpResponse {
    data: any;
    status?: number;
    message?: string;
    success?: boolean;
    errorCode?: number;
    constructor(options: Pick<HttpResponse, 'data' | 'status' | 'errorCode' | 'message' | 'success'>);
}
export declare function prefix(basePath?: string): (target: any) => any;
export interface DecoratorWrapperOptions {
    before?(ctx: Context): Promise<void>;
    after?(ctx: Context): Promise<any>;
    formatter?(returnValue: any): any;
    excludes?: string[];
}
export declare function wrapperProperty(target: any, descriptor: PropertyDescriptor, options?: Pick<DecoratorWrapperOptions, 'after' | 'before' | 'formatter'>): PropertyDescriptor;
export declare function wrapperAll(target: any, options: DecoratorWrapperOptions): void;
export declare function requests(method: AllowedMethods, pathStr: string): (target: any, name: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
