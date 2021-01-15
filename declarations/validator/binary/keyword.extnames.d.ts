import { AnySchemaObject, KeywordDefinition, SchemaObjCxt } from "ajv";
export declare function checkExtnames(schema: string | string[], _parentSchema: AnySchemaObject, _it: SchemaObjCxt): (data: string) => boolean;
export declare const extnameSchema: {
    $id: string;
    $schema: string;
    type: string[];
    definitions: {
        extnamePattern: {
            type: string;
            pattern: string;
        };
    };
    anyOf: ({
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
export declare const extnameDefinition: KeywordDefinition;
