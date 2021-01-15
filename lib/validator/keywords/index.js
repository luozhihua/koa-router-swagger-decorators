"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(ajv, options) {
    ajv.addKeyword({
        keyword: "numberlike",
        type: "string",
        schemaType: "number",
        compile: () => (data) => typeof data === "number" || /^\d+$/.test(data),
        errors: true,
    });
    ajv.addKeyword({
        keyword: "booleanlike",
        type: "string",
        schemaType: "boolean",
        compile: () => (data) => typeof data === "boolean" ||
            ["true", "false"].includes(data.toLowerCase()),
        errors: true,
    });
}
exports.default = default_1;
//# sourceMappingURL=index.js.map