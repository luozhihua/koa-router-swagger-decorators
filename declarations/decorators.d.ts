import { Context } from "koa";
import { SwaggerRouter } from "koa-swagger-decorator";
import { Config, AllowedMethods, ResponseFormatter } from "./utils";
export declare const rootRouter: SwaggerRouter;
export declare const RouterEvents: Pick<Config, "beforeController" | "afterController" | "formatter" | "validation">;
export declare function createRouter(config: Config): SwaggerRouter;
export declare function prefix(basePath?: string): (target: any) => any;
export interface DecoratorWrapperOptions {
    before?(ctx: Context, target: any, name: string): Promise<void>;
    after?(ctx: Context, target: any, name: string): Promise<any>;
    beforeFirst?(ctx: Context, target: any, name: string): Promise<void>;
    afterLast?(ctx: Context, target: any, name: string): Promise<any>;
    formatter?: ResponseFormatter;
}
export interface DecoratorWrapperAllOptions extends DecoratorWrapperOptions {
    excludes?: string[];
}
export declare function wrapperProperty(target: any, descriptor: PropertyDescriptor, options?: DecoratorWrapperOptions): any;
export declare function wrapperAll(target: any, options: DecoratorWrapperOptions & {
    excludes?: string[];
}): void;
export declare function requests(method: AllowedMethods, pathStr: string, formatter?: ResponseFormatter | boolean): (target: any, name: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
