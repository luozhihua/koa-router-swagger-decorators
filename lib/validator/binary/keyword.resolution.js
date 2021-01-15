"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxResolutionDefinition = exports.checkResolution = exports.maxResolution = void 0;
const image_size_1 = __importDefault(require("image-size"));
exports.maxResolution = {
    description: "图片分辨率",
    anyOf: [
        {
            type: "string",
            pattern: "^(\\d+)(px|PX)?\\s*[xX×Х╳*＊Ⅹⅹ,]\\s*(\\d+)(px|PX)?$",
        },
        {
            type: "string",
            pattern: "^\\d+(px|PX)?$",
        },
        { type: "number" },
        { type: "array", maxItems: 2, items: { type: "number" } },
        {
            type: "array",
            maxItems: 2,
            items: { type: "string", pattern: "^\\d+(px|PX)?$" },
        },
    ],
};
function parseResolution(value) {
    if (Array.isArray(value)) {
        return value.map((val) => {
            return typeof val === "string" ? parseInt(val) : val;
        });
    }
    else if (typeof value === "string") {
        const parts = value.split(/\s*[xX×Х╳*＊Ⅹⅹ,]\s*/);
        if (parts.length > 1) {
            return parts.map((val) => {
                return typeof val === "string" ? parseInt(val) : val;
            });
        }
        else {
            value = parseInt(value);
            return [value, value];
        }
    }
    else {
        return [value, value];
    }
}
const checkResolution = function (schema, parentSchema, _it) {
    return (data, _dataCtx) => {
        try {
            const props = JSON.parse(data);
            if (/^image\//.test(parentSchema.format)) {
                const { width = 0, height = 0 } = image_size_1.default(props.path);
                const maxSize = parseResolution(schema);
                return width * height < maxSize[0] * maxSize[1];
            }
            else {
                return true;
            }
        }
        catch (err) {
            return true;
        }
    };
};
exports.checkResolution = checkResolution;
exports.maxResolutionDefinition = {
    keyword: "maxResolution",
    type: ["string", "number"],
    schemaType: ["string", "number"],
    async: true,
    errors: true,
    schema: true,
    metaSchema: exports.maxResolution,
    compile: exports.checkResolution,
};
//# sourceMappingURL=keyword.resolution.js.map