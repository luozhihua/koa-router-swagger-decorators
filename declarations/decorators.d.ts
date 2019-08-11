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
export declare function prefix(basePath?: string): (constructor: any) => any;
export declare function wrapperAll(target: any, options: DecoratorWrapperOptions): void;
interface DecoratorWrapperOptions {
    before?(ctx: Context): Promise<void>;
    after?(ctx: Context, returnValue: any): Promise<any>;
    formatter?(returnValue: any): any;
}
export declare function wrapperProperty(descriptor: PropertyDescriptor, options?: DecoratorWrapperOptions): PropertyDescriptor;
export declare function requests(method: AllowedMethods, pathStr: string): (target: any, name: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export {};
