"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajv = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const ajv_keywords_1 = __importDefault(require("ajv-keywords"));
const lodash_1 = require("lodash");
const jsonschemaOptions = {
    allowUnknownAttributes: true,
    skipAttributes: [],
    throwError: true,
};
function getRequiredParamsName(schema) {
    const keys = Object.keys(schema);
    return keys.reduce((prev, next, index) => {
        const key = keys[index];
        if (schema[key].required) {
            prev.push(key);
        }
        delete schema[key].required;
        if (typeof schema[key].type === "function") {
            schema[key].type = schema[key].type.name.toLowerCase();
        }
        return prev;
    }, []);
}
function parseParams(schema, params) {
    Object.keys(params).forEach((key) => {
        const type = schema[key] ? schema[key].type : null;
        if (type && ["number", "boolean"].includes(type)) {
            try {
                params[key] = JSON.parse(params[key].toLowerCase());
            }
            catch (err) { }
        }
    });
    return params;
}
exports.ajv = new ajv_1.default({
    verbose: true,
    allErrors: true,
    validateFormats: true,
});
ajv_formats_1.default(exports.ajv, { mode: "fast", keywords: true });
ajv_keywords_1.default(exports.ajv);
exports.ajv.addKeyword({
    keyword: "numberlike",
    type: "string",
    schemaType: "number",
    compile: () => (data) => typeof data === "number" || /^\d+$/.test(data),
    errors: true,
});
exports.ajv.addKeyword({
    keyword: "booleanlike",
    type: "string",
    schemaType: "boolean",
    compile: () => (data) => typeof data === "boolean" || ["true", "false"].includes(data.toLowerCase()),
    errors: true,
});
function schemaMapper(key, val) {
    if (val && val.type === "file") {
        val.type = "string";
        val.format = "binary";
    }
    return val;
}
async function validateByAJV(name, paramsType, params, schema) {
    const schemaCopy = JSON.parse(JSON.stringify(schema, schemaMapper));
    const requiresParams = getRequiredParamsName(schemaCopy);
    const wrappedSchema = {
        $async: true,
        type: "object",
        properties: schemaCopy,
        required: requiresParams,
    };
    params = parseParams(schema, params);
    const validate = exports.ajv.compile(wrappedSchema);
    return new Promise((resolve) => {
        validate(params, {
            dataPath: name,
            parentData: {},
            parentDataProperty: "",
            dynamicAnchors: {},
            rootData: params,
        })
            .then(() => {
            resolve(null);
        })
            .catch((err) => {
            let errors = null;
            if (err.errors) {
                errors = err.errors.map((e) => {
                    const picked = lodash_1.pick(e, [
                        "keyword",
                        "message",
                        "data",
                        "params",
                        "dataPath",
                        "paramsType",
                    ]);
                    lodash_1.update(picked, "dataPath", (v) => v.replace(/\//g, "."));
                    picked.paramsType = paramsType;
                    return picked;
                });
            }
            resolve(errors);
        });
    });
}
async function KoaParamsValidator(ctx, target, name) {
    const { parameters: schemas = {} } = target[name];
    const parameters = {
        header: ctx.headers,
        path: ctx.params,
        query: ctx.query,
        body: ctx.request.body,
        formData: ctx.request.body,
    };
    let errors = await Promise.all(Object.keys(schemas).map((type) => {
        if (parameters[type]) {
            return (validateByAJV(`${target.name}.${name}(ctx.${type}) => ${type}`, type, parameters[type], schemas[type]) || null);
        }
        else {
            return null;
        }
    }));
    errors = errors.filter((e) => e !== null);
    return errors.length === 0 ? null : errors;
}
exports.default = KoaParamsValidator;
//# sourceMappingURL=index.js.map