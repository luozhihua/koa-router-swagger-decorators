import { AnySchemaObject, KeywordDefinition, SchemaObjCxt } from "ajv";
import multimatch from "multimatch";
import { BinaryProps } from "./types";
import { cloneDeep } from "lodash";

export function checkExtnames(
  schema: string | string[],
  _parentSchema: AnySchemaObject,
  _it: SchemaObjCxt
) {
  return (data: string) => {
    try {
      let allowExts: string[];
      const replacer = /^[\.\*\s,\;\|]+|[\s,\;\|]+$/gi;
      if (typeof schema === "string") {
        allowExts = schema.replace(replacer, "").split(/[,\;\|]/);
      } else {
        allowExts = cloneDeep(schema).map((v) => v.replace(replacer, ""));
      }

      const props: BinaryProps = JSON.parse(data);
      const matched =
        multimatch(
          [props.name],
          allowExts.map((v) => `*${v}`)
        ).length > 0;
      const included = allowExts.some((allowed) => {
        let ext = props.name.split(".").pop();
        return [ext, `.${ext}`, `*.${ext}`].includes(allowed);
      });
      return matched || included;
    } catch (err) {
      return true;
    }
  };
}

export const extnameSchema = {
  $id: `parallet.io.validator.file.extnames`,
  $schema: "http://json-schema.org/draft-07/schema#",
  type: ["string", "array"],
  definitions: {
    extnamePattern: {
      type: "string",
      pattern: "^(\\*?(\\.\\w+){1,2}[,;\\|]?)+$",
      // pattern: "^(\\*?(\\.?[0-9a-zA-Z]+){1,2}[,;\\|$])+",
      // pattern: "^(\\*?(.?[0-9a-zA-Z]+){1,2}[,;\\|$])+",
      // pattern: `/^\\.+/`,
    },
  },
  anyOf: [
    { $ref: "#/definitions/extnamePattern" },
    {
      type: "array",
      items: { $ref: "#/definitions/extnamePattern" },
    },
  ],
};

export const extnameDefinition: KeywordDefinition = {
  keyword: "extnames",
  type: "string",
  schemaType: ["string", "array"],
  async: true,
  errors: true,
  schema: true,
  metaSchema: extnameSchema,
  compile: checkExtnames,
};
