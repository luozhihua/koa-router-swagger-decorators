"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function parse(data) {
    const props = JSON.parse(data);
    return props;
}
function genRegularFormat(type) {
    return (data) => {
        const props = JSON.parse(data);
        const exp = `^${type}\\/(\\*|[\\w\\*]+[\\w\\*\\-\\+\\.]+[\\w\\*])$`;
        const matcher = new RegExp(exp);
        return matcher.test(props.type);
    };
}
exports.default = {
    image: genRegularFormat("image"),
    video: genRegularFormat("video"),
    audio: genRegularFormat("audio"),
    font: genRegularFormat("font"),
    xml: (data) => {
        const props = parse(data);
        return ["application/xml", "text/xml"].includes(props.type);
    },
    html: (data) => {
        const props = parse(data);
        return ["application/xhtml+xml", "text/html", "text/xhtml"].includes(props.type);
    },
    css: (data) => {
        const props = parse(data);
        return ["text/css", "text/scss", "text/sass"].includes(props.type);
    },
    js: (data) => {
        const props = parse(data);
        return ["text/javascript"].includes(props.type);
    },
    json: (data) => {
        const props = parse(data);
        return "application/json" === props.type;
    },
    pdf: (data) => {
        const props = parse(data);
        return ["application/pdf"].includes(props.type);
    },
    ppt: (data) => {
        const props = parse(data);
        return [
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ].includes(props.type);
    },
    doc: (data) => {
        const props = parse(data);
        return [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(props.type);
    },
    archive: (data) => {
        const props = parse(data);
        return [
            "application/x-rar-compressed",
            "application/x-tar",
            "application/zip",
            "application/x-7z-compressed",
        ].includes(props.type);
    },
    binary: (data) => {
        const props = parse(data);
        return props.name && props.path && fs_1.default.existsSync(props.path);
    },
};
//# sourceMappingURL=formats.js.map