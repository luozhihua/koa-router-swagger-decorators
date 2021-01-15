import Ajv from "ajv";
import bytes from "bytes";

interface Options {}
export default function (ajv: Ajv, options?: Options) {
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
    compile: () => (data) =>
      typeof data === "boolean" ||
      ["true", "false"].includes(data.toLowerCase()),
    errors: true,
  });
}
