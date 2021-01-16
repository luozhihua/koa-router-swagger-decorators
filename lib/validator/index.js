"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajv = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const ajv_keywords_1 = __importDefault(require("ajv-keywords"));
const binary_1 = require("./binary");
const keywords_1 = __importDefault(require("./keywords"));
const lodash_1 = require("lodash");
exports.ajv = new ajv_1.default({
    verbose: true,
    allErrors: true,
    validateFormats: true,
});
ajv_formats_1.default(exports.ajv, { mode: "fast", keywords: true });
ajv_keywords_1.default(exports.ajv);
binary_1.useImage(exports.ajv);
keywords_1.default(exports.ajv);
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
function getFileProperties(ctx, key) {
    const { files } = ctx.request;
    const file = files ? files[key] : undefined;
    if (file) {
        const allowProps = [
            "hash",
            "lastModifiedDate",
            "name",
            "path",
            "size",
            "type",
        ];
        return JSON.stringify({
            fieldName: key,
            ...lodash_1.pick(file, allowProps),
        });
    }
}
function prepareParams(ctx, type, schemas, parameters) {
    const schema = schemas[type];
    const params = parameters[type];
    Object.keys(schema).forEach((key) => {
        const type = schema[key] ? schema[key].type : null;
        if (type === "file") {
            schema[key].type = "string";
            params[key] = getFileProperties(ctx, key);
        }
        if (type && ["number", "boolean"].includes(type)) {
            if (typeof params[type] === "string") {
                params[key] = JSON.parse(params[key].toLowerCase());
            }
        }
    });
    return params;
}
async function validateByAJV(name, paramsType, params, schema, parentData = {}) {
    const requiresParams = getRequiredParamsName(schema);
    const wrappedSchema = {
        $async: true,
        type: "object",
        properties: schema,
        required: requiresParams,
    };
    const validate = exports.ajv.compile(wrappedSchema);
    return new Promise((resolve) => {
        validate(params, {
            dataPath: name,
            parentData: parentData,
            parentDataProperty: paramsType,
            dynamicAnchors: {},
            rootData: parentData,
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
    const schemas = lodash_1.cloneDeep(target[name].parameters) || {};
    const parameters = {
        header: ctx.headers,
        path: ctx.params,
        query: ctx.query,
        body: ctx.request.body,
        formData: ctx.request.body,
    };
    let errors = await Promise.all(Object.keys(schemas).map((type) => {
        if (parameters[type]) {
            const params = prepareParams(ctx, type, schemas, parameters);
            return (validateByAJV(`${target.name}.${name}(ctx.${type}) => ${type}`, type, params, schemas[type], parameters) || null);
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