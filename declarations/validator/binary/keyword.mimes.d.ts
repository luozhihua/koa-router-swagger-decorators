import { AnySchemaObject, SchemaObjCxt } from "ajv";
import { DataValidationCxt, KeywordDefinition } from "ajv/dist/types";
export declare function checkMimes(schema: string | string[], _parentSchema: AnySchemaObject, _it: SchemaObjCxt): (data: string, _dataCtx?: DataValidationCxt<string | number> | undefined) => boolean;
export declare const mimesSchema: {
    $id: string;
    $schema: string;
    type: string[];
    definitions: {
        mimesPattern: {
            type: string;
            pattern: string;
        };
    };
    oneOf: ({
        $ref: string;
        type?: undefined;
        items?: undefined;
    } | {
        type: string;
        items: {
            $ref: string;
        };
        $ref?: undefined;
    })[];
};
export declare const mimesDefinition: KeywordDefinition;
