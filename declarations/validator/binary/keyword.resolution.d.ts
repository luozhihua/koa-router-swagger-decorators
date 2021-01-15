import type { KeywordDefinition } from "ajv";
import { CompileKeywordFunc } from "ajv/dist/types";
export declare const maxResolution: {
    description: string;
    anyOf: ({
        type: string;
        pattern: string;
        maxItems?: undefined;
        items?: undefined;
    } | {
        type: string;
        pattern?: undefined;
        maxItems?: undefined;
        items?: undefined;
    } | {
        type: string;
        maxItems: number;
        items: {
            type: string;
            pattern?: undefined;
        };
        pattern?: undefined;
    } | {
        type: string;
        maxItems: number;
        items: {
            type: string;
            pattern: string;
        };
        pattern?: undefined;
    })[];
};
export declare const checkResolution: CompileKeywordFunc;
export declare const maxResolutionDefinition: KeywordDefinition;
