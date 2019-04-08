"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("./decorators");
const swagger_1 = require("./swagger");
exports.default = async (config) => {
    const router = swagger_1.default(config);
    decorators_1.rootRouter.use(router.routes());
    return decorators_1.rootRouter;
};
//# sourceMappingURL=router.js.map