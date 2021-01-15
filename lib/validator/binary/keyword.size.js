"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxSizeDefinition = exports.checkSize = exports.maxSizeSchema = void 0;
const bytes_1 = __importDefault(require("bytes"));
exports.maxSizeSchema = {
    description: "文件字节大小, 单位(不区分大小写)：B,KB,MB,GB,TB,PB",
    anyOf: [
        { type: "number", description: "纯数字类型，默认单位 Byte", minimum: 0 },
        {
            type: "string",
            pattern: "^\\d+(\\.\\d+)?\\s?[Bb]?$",
            description: "匹配`1B, 1024B, 12043.323b` 等带Byte单位的字符`",
        },
        {
            type: "string",
            pattern: "^\\d+(\\.\\d+)?\\s?[kmgtpKMGTP][Bb]?$",
            description: "匹配`1MB, 1024Kb, 12043.323Pb` 等带单位的字符`",
        },
    ],
};
const checkSize = function (schema, _parentSchema, _it) {
    return (data, _dataCtx) => {
        try {
            const props = JSON.parse(data);
            const size = props.size;
            const maxSize = bytes_1.default.parse(schema + (/[Bb]$/.test(schema + "") ? "" : "b"));
            return size <= maxSize;
        }
        catch (err) {
            return true;
        }
    };
};
exports.checkSize = checkSize;
exports.maxSizeDefinition = {
    keyword: "maxSize",
    type: "string",
    schemaType: ["string", "number"],
    async: true,
    errors: true,
    schema: true,
    metaSchema: exports.maxSizeSchema,
    compile: exports.checkSize,
};
//# sourceMappingURL=keyword.size.js.map