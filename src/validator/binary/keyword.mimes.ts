import { AnySchemaObject, SchemaObjCxt } from "ajv";
import { DataValidationCxt, KeywordDefinition } from "ajv/dist/types";
import { BinaryProps } from "./types";
import multimatch from "multimatch";
import { cloneDeep } from "lodash";

export function checkMimes(
  schema: string | string[],
  _parentSchema: AnySchemaObject,
  _it: SchemaObjCxt
) {
  return (data: string, _dataCtx?: DataValidationCxt) => {
    try {
      let allowMimes: string[];
      const replacer = /^[\s,\;\|]+|[\s,\;\|]+$/gi;
      if (typeof schema === "string") {
        allowMimes = schema.replace(replacer, "").split(/[,\;\|]/);
      } else {
        allowMimes = cloneDeep(schema).map((v) => v.replace(replacer, ""));
      }

      const props: BinaryProps = JSON.parse(data);
      const matched = multimatch([props.type], allowMimes).length > 0;
      const included = allowMimes.some((mime) => mime === props.type);
      return matched || included;
    } catch (err) {
      return true;
    }
  };
}

const regularMimes =
  "application|audio|chemical|font|image|message|model|multipart|text|video|x-\\w+";
export const mimesSchema = {
  $id: `parallet.io.validator.file.mimes`,
  $schema: "http://json-schema.org/draft-07/schema#",
  type: ["string", "array"],
  definitions: {
    mimesPattern: {
      type: "string",
      pattern: `^((${regularMimes})\\/(\\*|[\\w\\*]+[\\w\\*\\-\\+\\.]+[\\w\\*])[,;\\|]?)+$`,
    },
  },
  oneOf: [
    { $ref: "#/definitions/mimesPattern" },
    {
      type: "array",
      items: { $ref: "#/definitions/mimesPattern" },
    },
  ],
};

export const mimesDefinition: KeywordDefinition = {
  keyword: "mimes",
  type: "string",
  schemaType: ["string", "array"],
  async: true,
  errors: true,
  schema: true,
  metaSchema: mimesSchema,
  compile: checkMimes,
};
