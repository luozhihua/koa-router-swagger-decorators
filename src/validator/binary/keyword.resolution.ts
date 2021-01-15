import type { AnySchemaObject, KeywordDefinition, SchemaObjCxt } from "ajv";
import { CompileKeywordFunc, DataValidationCxt } from "ajv/dist/types";
import { BinaryProps } from "./types";
import imageSize from "image-size";

// max resolution schema
export const maxResolution = {
  description: "图片分辨率",
  anyOf: [
    {
      type: "string",
      pattern: "^(\\d+)(px|PX)?\\s*[xX×Х╳*＊Ⅹⅹ,]\\s*(\\d+)(px|PX)?$",
    },
    {
      type: "string",
      pattern: "^\\d+(px|PX)?$",
    },
    { type: "number" },
    { type: "array", maxItems: 2, items: { type: "number" } },
    {
      type: "array",
      maxItems: 2,
      items: { type: "string", pattern: "^\\d+(px|PX)?$" },
    },
  ],
};

type ResolutionSchema = number | string | number[] | string[];

function parseResolution(value: ResolutionSchema): number[] {
  if (Array.isArray(value)) {
    return (value as any).map((val: string | number) => {
      return typeof val === "string" ? parseInt(val) : val;
    });
  } else if (typeof value === "string") {
    const parts: string[] = value.split(/\s*[xX×Х╳*＊Ⅹⅹ,]\s*/);

    if (parts.length > 1) {
      return parts.map((val: string | number) => {
        return typeof val === "string" ? parseInt(val) : val;
      });
    } else {
      value = parseInt(value);
      return [value, value];
    }
  } else {
    return [value, value];
  }
}

export const checkResolution: CompileKeywordFunc = function (
  schema: ResolutionSchema,
  parentSchema: AnySchemaObject,
  _it: SchemaObjCxt
) {
  return (data: string, _dataCtx?: DataValidationCxt) => {
    try {
      const props: BinaryProps = JSON.parse(data);
      if (/^image\//.test(parentSchema.format)) {
        const { width = 0, height = 0 } = imageSize(props.path);
        const maxSize = parseResolution(schema);
        return width * height < maxSize[0] * maxSize[1];
      } else {
        return true;
      }
    } catch (err) {
      return true;
    }
  };
};

export const maxResolutionDefinition: KeywordDefinition = {
  keyword: "maxResolution",
  type: ["string", "number"],
  schemaType: ["string", "number"],
  async: true,
  errors: true,
  schema: true,
  metaSchema: maxResolution,
  compile: checkResolution,
};
