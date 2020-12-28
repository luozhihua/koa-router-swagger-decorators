import { Context } from "koa";
export declare type ResponseFormatter = (ctx: Context, result: any) => any;
export interface SwaggerConfig {
}
export interface KoaRouterConfig {
    controllersDir: string;
    packageFile: string;
    swaggerConfig?: SwaggerConfig;
}
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
export declare const config: Config;
