"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const koa_swagger_decorator_1 = require("koa-swagger-decorator");
function readPkg(pkgFile) {
    return fs.existsSync(pkgFile)
        ? JSON.parse(fs.readFileSync(pkgFile, "utf-8"))
        : {};
}
function default_1(config) {
    let pkg;
    let swaggerConfig;
    if (config.packageFile) {
        pkg = readPkg(config.packageFile);
    }
    else {
        pkg = {};
    }
    const defaultConf = {
        title: pkg.name ? `API Doc of ${pkg.name}` : "API Docs",
        description: pkg.description || "",
        version: pkg.version || "",
        prefix: "/",
        recursive: true,
        validatable: false,
        swaggerOptions: {
            securityDefinitions: {
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "Authorization",
                },
            },
        },
        swaggerConfiguration: {
            display: {
                defaultModelsExpandDepth: 4,
                defaultModelExpandDepth: 3,
                docExpansion: "list",
                defaultModelRendering: "model",
            },
        },
    };
    swaggerConfig = lodash_merge_1.default(true, defaultConf, config.swaggerConfig, {
        validatable: false,
    });
    const swaggerRouter = new koa_swagger_decorator_1.SwaggerRouter({ prefix: swaggerConfig.prefix }, swaggerConfig);
    swaggerRouter.swagger();
    swaggerRouter.mapDir(config.controllersDir, {
        recursive: config.recursive,
        doValidation: config.validatable,
    });
    swaggerRouter.config = swaggerConfig;
    return swaggerRouter;
}
exports.default = default_1;
//# sourceMappingURL=swagger.js.map