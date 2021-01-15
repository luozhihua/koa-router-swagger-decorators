"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extnameDefinition = exports.extnameSchema = exports.checkExtnames = void 0;
const multimatch_1 = __importDefault(require("multimatch"));
const lodash_1 = require("lodash");
function checkExtnames(schema, _parentSchema, _it) {
    return (data) => {
        try {
            let allowExts;
            const replacer = /^[\.\*\s,\;\|]+|[\s,\;\|]+$/gi;
            if (typeof schema === "string") {
                allowExts = schema.replace(replacer, "").split(/[,\;\|]/);
            }
            else {
                allowExts = lodash_1.cloneDeep(schema).map((v) => v.replace(replacer, ""));
            }
            const props = JSON.parse(data);
            const matched = multimatch_1.default([props.name], allowExts.map((v) => `*${v}`)).length > 0;
            const included = allowExts.some((allowed) => {
                let ext = props.name.split(".").pop();
                return [ext, `.${ext}`, `*.${ext}`].includes(allowed);
            });
            return matched || included;
        }
        catch (err) {
            return true;
        }
    };
}
exports.checkExtnames = checkExtnames;
exports.extnameSchema = {
    $id: `parallet.io.validator.file.extnames`,
    $schema: "http://json-schema.org/draft-07/schema#",
    type: ["string", "array"],
    definitions: {
        extnamePattern: {
            type: "string",
            pattern: "^(\\*?(\\.\\w+){1,2}[,;\\|]?)+$",
        },
    },
    anyOf: [
        { $ref: "#/definitions/extnamePattern" },
        {
            type: "array",
            items: { $ref: "#/definitions/extnamePattern" },
        },
    ],
};
exports.extnameDefinition = {
    keyword: "extnames",
    type: "string",
    schemaType: ["string", "array"],
    async: true,
    errors: true,
    schema: true,
    metaSchema: exports.extnameSchema,
    compile: checkExtnames,
};
//# sourceMappingURL=keyword.extnames.js.map