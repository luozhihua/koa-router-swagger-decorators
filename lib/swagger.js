"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const merge = __importStar(require("merge"));
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
    swaggerConfig = merge.recursive(true, defaultConf, config.swaggerConfig, {
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