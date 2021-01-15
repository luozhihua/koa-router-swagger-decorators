"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mimesDefinition = exports.mimesSchema = exports.checkMimes = void 0;
const multimatch_1 = __importDefault(require("multimatch"));
const lodash_1 = require("lodash");
function checkMimes(schema, _parentSchema, _it) {
    return (data, _dataCtx) => {
        try {
            let allowMimes;
            const replacer = /^[\s,\;\|]+|[\s,\;\|]+$/gi;
            if (typeof schema === "string") {
                allowMimes = schema.replace(replacer, "").split(/[,\;\|]/);
            }
            else {
                allowMimes = lodash_1.cloneDeep(schema).map((v) => v.replace(replacer, ""));
            }
            const props = JSON.parse(data);
            const matched = multimatch_1.default([props.type], allowMimes).length > 0;
            const included = allowMimes.some((mime) => mime === props.type);
            return matched || included;
        }
        catch (err) {
            return true;
        }
    };
}
exports.checkMimes = checkMimes;
const regularMimes = "application|audio|chemical|font|image|message|model|multipart|text|video|x-\\w+";
exports.mimesSchema = {
    $id: `parallet.io.validator.file.mimes`,
    $schema: "http://json-schema.org/draft-07/schema#",
    type: ["string", "array"],
    definitions: {
        mimesPattern: {
            type: "string",
            pattern: `^((${regularMimes})\\/(\\*|[\\w\\*]+[\\w\\*\\-\\+\\.]+[\\w\\*])[,;\\|]?)+$`,
        },
    },
    oneOf: [
        { $ref: "#/definitions/mimesPattern" },
        {
            type: "array",
            items: { $ref: "#/definitions/mimesPattern" },
        },
    ],
};
exports.mimesDefinition = {
    keyword: "mimes",
    type: "string",
    schemaType: ["string", "array"],
    async: true,
    errors: true,
    schema: true,
    metaSchema: exports.mimesSchema,
    compile: checkMimes,
};
//# sourceMappingURL=keyword.mimes.js.map