import { Context } from 'koa';
export declare type AllowedMethods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'option';
export declare const GET: AllowedMethods;
export declare const POST: AllowedMethods;
export declare const DELETE: AllowedMethods;
export declare const PUT: AllowedMethods;
export declare const PATCH: AllowedMethods;
export declare const OPTION: AllowedMethods;
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
    formatter?: (ctx: Context, result: any) => any;
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
    noWrapper?: boolean;
    constructor(options: Pick<HttpResponse, 'data' | 'status' | 'errorCode' | 'message' | 'success' | 'noWrapper'>);
}
export declare function defaultFormatter(ctx: Context, result: any): any;
