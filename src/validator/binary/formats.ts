import { BinaryProps } from "./types";
import fs from "fs";

function parse(data: string): BinaryProps {
  const props: BinaryProps = JSON.parse(data);
  return props;
}

function genRegularFormat(type: string) {
  return (data: string) => {
    const props: BinaryProps = JSON.parse(data);
    const exp = `^${type}\\/(\\*|[\\w\\*]+[\\w\\*\\-\\+\\.]+[\\w\\*])$`;
    const matcher = new RegExp(exp);
    return matcher.test(props.type);
  };
}

export default {
  // ...["image", "video", "audio", "font"].map(genRegularFormat),
  image: genRegularFormat("image"),
  video: genRegularFormat("video"),
  audio: genRegularFormat("audio"),
  font: genRegularFormat("font"),

  xml: (data: string) => {
    const props = parse(data);
    return ["application/xml", "text/xml"].includes(props.type);
  },

  html: (data: string) => {
    const props = parse(data);
    return ["application/xhtml+xml", "text/html", "text/xhtml"].includes(
      props.type
    );
  },

  css: (data: string) => {
    const props = parse(data);
    return ["text/css", "text/scss", "text/sass"].includes(props.type);
  },

  js: (data: string) => {
    const props = parse(data);
    return ["text/javascript"].includes(props.type);
  },

  json: (data: string) => {
    const props = parse(data);
    return "application/json" === props.type;
  },

  pdf: (data: string) => {
    const props = parse(data);
    return ["application/pdf"].includes(props.type);
  },

  ppt: (data: string) => {
    const props = parse(data);
    return [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].includes(props.type);
  },

  doc: (data: string) => {
    const props = parse(data);
    return [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(props.type);
  },

  archive: (data: string) => {
    const props = parse(data);
    return [
      "application/x-rar-compressed",
      "application/x-tar",
      "application/zip",
      "application/x-7z-compressed",
    ].includes(props.type);
  },

  binary: (data: string) => {
    const props = parse(data);
    return props.name && props.path && fs.existsSync(props.path);
  },
};
