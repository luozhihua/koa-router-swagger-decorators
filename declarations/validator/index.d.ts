import { Context } from "koa";
import Ajv, { JSONSchemaType } from "ajv";
export declare const ajv: Ajv;
export interface Parameters {
    header: {
        [k: string]: string;
    };
    path: {
        [k: string]: string;
    };
    query: {
        [k: string]: string;
    };
    body: {
        [k: string]: any;
    };
    formData: {
        [k: string]: string;
    };
}
export declare type Schema<T> = {
    [K in keyof T]?: JSONSchemaType<T[K], true>;
};
export declare type Params<T> = {
    [K in keyof T]?: T[K];
};
export default function KoaParamsValidator(ctx: Context, target: any, name: string): Promise<any>;
