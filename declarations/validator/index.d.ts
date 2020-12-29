import { Context } from "koa";
import Ajv, { JSONSchemaType } from "ajv";
export declare type Schema<T> = {
    [K in keyof T]: JSONSchemaType<T[K], true>;
};
export declare type Params<T> = {
    [K in keyof T]: T[K];
};
export declare const ajv: Ajv;
export default function KoaParamsValidator(ctx: Context, target: any, name: string): Promise<any>;
