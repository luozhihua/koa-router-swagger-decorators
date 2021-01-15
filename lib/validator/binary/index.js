"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useImage = exports.metaSchema = void 0;
const keyword_mimes_1 = require("./keyword.mimes");
const keyword_resolution_1 = require("./keyword.resolution");
const keyword_size_1 = require("./keyword.size");
const formats_1 = __importDefault(require("./formats"));
const keyword_extnames_1 = require("./keyword.extnames");
exports.metaSchema = {
    type: "object",
    properties: {
        extnames: keyword_extnames_1.extnameSchema,
        mimes: keyword_mimes_1.mimesSchema,
        maxResolution: keyword_resolution_1.maxResolution,
        maxSize: keyword_size_1.maxSizeSchema,
    },
};
function useImage(ajv, options) {
    Object.keys(formats_1.default).forEach((name) => {
        ajv.addFormat(name, formats_1.default[name]);
    });
    ajv.addKeyword(keyword_size_1.maxSizeDefinition);
    ajv.addKeyword(keyword_resolution_1.maxResolutionDefinition);
    ajv.addKeyword(keyword_mimes_1.mimesDefinition);
    ajv.addKeyword(keyword_extnames_1.extnameDefinition);
}
exports.useImage = useImage;
//# sourceMappingURL=index.js.map