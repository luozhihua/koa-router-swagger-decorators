import { KeywordDefinition } from "ajv";
import { CompileKeywordFunc } from "ajv/dist/types";
export declare const maxSizeSchema: {
    description: string;
    anyOf: ({
        type: string;
        description: string;
        minimum: number;
        pattern?: undefined;
    } | {
        type: string;
        pattern: string;
        description: string;
        minimum?: undefined;
    })[];
};
export declare const checkSize: CompileKeywordFunc;
export declare const maxSizeDefinition: KeywordDefinition;
