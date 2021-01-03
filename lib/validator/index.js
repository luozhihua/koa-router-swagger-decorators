"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = require("ajv");
const ajv_formats_1 = require("ajv-formats");
const addKeywords = require("ajv-keywords");
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
addKeywords.default(exports.ajv);
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
function validateByAJV(name, paramsType, params, schema) {
    const schemaCopy = JSON.parse(JSON.stringify(schema));
    const requiresParams = getRequiredParamsName(schemaCopy);
    const wrappedSchema = {
        type: "object",
        properties: schemaCopy,
        required: requiresParams,
    };
    params = parseParams(schema, params);
    const validate = exports.ajv.compile(wrappedSchema);
    const valid = validate(params, {
        dataPath: name,
        parentData: {},
        parentDataProperty: "",
        dynamicAnchors: {},
        rootData: params,
    });
    if (!valid) {
        return validate.errors
            ? validate.errors.map((e) => {
                const picked = lodash_1.pick(e, [
                    "keyword",
                    "message",
                    "data",
                    "params",
                    "dataPath",
                ]);
                lodash_1.update(picked, "dataPath", (v) => v.replace(/\//g, "."));
                picked.paramsType = paramsType;
                return picked;
            })
            : null;
    }
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
    const errors = Object.keys(schemas)
        .map((type) => {
        if (parameters[type]) {
            return (validateByAJV(`${target.name}.${name}(ctx.${type}) => ${type}`, type, parameters[type], schemas[type]) || null);
        }
        else {
            return null;
        }
    })
        .filter((e) => e !== null);
    const flattenErrors = {};
    function flat(errs) {
        errs.forEach((err) => {
            if (Array.isArray(err)) {
                flat(err);
            }
            else {
                flattenErrors[err.paramsType] = flattenErrors[err.paramsType] || [];
                flattenErrors[err.paramsType].push(err);
            }
        });
    }
    flat(errors);
    return flattenErrors.length === 0 ? null : flattenErrors;
}
exports.default = KoaParamsValidator;
//# sourceMappingURL=index.js.map