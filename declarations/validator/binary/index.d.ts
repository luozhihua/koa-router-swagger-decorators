import Ajv from "ajv";
export declare const metaSchema: {
    type: string;
    properties: {
        extnames: {
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
        mimes: {
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
        maxResolution: {
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
        maxSize: {
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
    };
};
export interface ImageOptions {
}
export declare function useImage(ajv: Ajv, options?: ImageOptions): void;
