"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const merge = require("merge");
const koa_swagger_decorator_1 = require("koa-swagger-decorator");
function readPkg(pkgFile) {
    let pkg;
    if (fs.existsSync(pkgFile)) {
        pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    }
    else {
        pkg = {};
    }
    return pkg;
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
        title: pkg.name ? `API Doc of ${pkg.name}` : 'API Docs',
        description: pkg.description || '',
        version: pkg.version || '',
        prefix: '/',
        swaggerOptions: {
            securityDefinitions: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization'
                }
            }
        },
        swaggerConfiguration: {
            display: {
                defaultModelsExpandDepth: 4,
                defaultModelExpandDepth: 3,
                docExpansion: 'list',
                defaultModelRendering: 'model'
            }
        }
    };
    swaggerConfig = merge.recursive(true, defaultConf, config.swaggerConfig);
    const swaggerRouter = new koa_swagger_decorator_1.SwaggerRouter({ prefix: swaggerConfig.prefix }, swaggerConfig);
    swaggerRouter.swagger();
    swaggerRouter.mapDir(config.controllersDir, {
        recursive: true,
        doValidation: false,
    });
    swaggerRouter.config = swaggerConfig;
    return swaggerRouter;
}
exports.default = default_1;
//# sourceMappingURL=swagger.js.map