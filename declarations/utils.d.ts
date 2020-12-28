import { Context } from "koa";
export declare type AllowedMethods = "get" | "post" | "put" | "delete" | "patch" | "option";
export declare const GET: AllowedMethods;
export declare const POST: AllowedMethods;
export declare const DELETE: AllowedMethods;
export declare const PUT: AllowedMethods;
export declare const PATCH: AllowedMethods;
export declare const OPTION: AllowedMethods;
export interface SwaggerConfig {
}
export declare type ResponseFormatter = (ctx: Context, result: any) => any;
export interface Config {
    controllersDir: string;
    packageFile: string;
    swaggerConfig?: SwaggerConfig;
    recursive?: boolean;
    validatable?: boolean;
    validation?: <T = boolean>(ctx: Context, target: any, name: string) => Promise<T>;
    beforeController?: (ctx: Context, target: any, name: string) => Promise<any>;
    afterController?: (ctx: Context, target: any, name: string) => Promise<any>;
    formatter?: ResponseFormatter;
}
export interface ResponseData {
    status: number;
    message: string;
    success: boolean;
    data: any;
}
export interface KoaRouterConfig {
    controllersDir: string;
    packageFile: string;
    swaggerConfig?: SwaggerConfig;
}
export declare class HttpStatusError extends Error {
    status: number;
    errors: any;
    constructor(status: number, message: string, errors?: any);
}
export declare class HttpResponse {
    data: any;
    status?: number;
    message?: string;
    success?: boolean;
    errorCode?: number | string;
    errors?: any;
    noWrapper?: boolean;
    constructor(options: Pick<HttpResponse, "data" | "status" | "errors" | "errorCode" | "message" | "success" | "noWrapper">);
}
export declare const defaultFormatter: ResponseFormatter;
export declare function namedFunction(target: any, funcName: any, func: any): (...params: any[]) => any;
