import { AnySchemaObject, KeywordDefinition, SchemaObjCxt } from "ajv";
import {
  CompileKeywordFunc,
  DataValidationCxt,
  ValidateFunction,
} from "ajv/dist/types";
import bytes from "bytes";

export const maxSizeSchema = {
  description: "文件字节大小, 单位(不区分大小写)：B,KB,MB,GB,TB,PB",
  anyOf: [
    { type: "number", description: "纯数字类型，默认单位 Byte", minimum: 0 },
    {
      type: "string",
      pattern: "^\\d+(\\.\\d+)?\\s?[Bb]?$",
      description: "匹配`1B, 1024B, 12043.323b` 等带Byte单位的字符`",
    },
    {
      type: "string",
      pattern: "^\\d+(\\.\\d+)?\\s?[kmgtpKMGTP][Bb]?$",
      description: "匹配`1MB, 1024Kb, 12043.323Pb` 等带单位的字符`",
    },
  ],
};

export const checkSize: CompileKeywordFunc = function (
  schema: any,
  _parentSchema: AnySchemaObject,
  _it: SchemaObjCxt
) {
  return (data: string, _dataCtx?: DataValidationCxt) => {
    try {
      const props = JSON.parse(data);
      const size = props.size;
      const maxSize = bytes.parse(
        schema + (/[Bb]$/.test(schema + "") ? "" : "b")
      );
      return size <= maxSize;
    } catch (err) {
      return true;
    }
  };
};

export const maxSizeDefinition: KeywordDefinition = {
  keyword: "maxSize",
  type: "string",
  schemaType: ["string", "number"],
  async: true,
  errors: true,
  schema: true,
  metaSchema: maxSizeSchema,
  compile: checkSize,
};
