import { Context } from "koa";
import Ajv, { JSONSchemaType } from "ajv";
import useFormats from "ajv-formats";
import useKeywords from "ajv-keywords";
import { useImage } from "./binary";
import useCustomKeywords from "./keywords";
import { pick, update, cloneDeep } from "lodash";

export const ajv = new Ajv({
  verbose: true,
  allErrors: true,
  validateFormats: true,
}); // options can be passed, e.g. {allErrors: true}\

useFormats(ajv, { mode: "fast", keywords: true });
useKeywords(ajv);
useImage(ajv);
useCustomKeywords(ajv);

// interface Schema {
//   [k: string]: any;
// }
export interface Parameters {
  header: { [k: string]: string };
  path: { [k: string]: string };
  query: { [k: string]: string };
  body: { [k: string]: any };
  formData: { [k: string]: string };
}

export type Schema<T> = {
  [K in keyof T]?: JSONSchemaType<T[K], true>;
};

export type Params<T> = {
  [K in keyof T]?: T[K];
};

const jsonschemaOptions = {
  allowUnknownAttributes: true, // boolean
  skipAttributes: [], // string[],
  throwError: true, // boolean
  // rewrite: RewriteFunction, // Function
  // propertyName: string, // string
  // base: string, // string
};

/**
 * 获取必要参数名
 * @param schema
 */
function getRequiredParamsName<T>(schema: Schema<T>): string[] {
  const keys: string[] = Object.keys(schema);
  return keys.reduce((prev: string[], next, index) => {
    const key = keys[index];
    if (schema[key].required) {
      prev.push(key);
    }
    delete schema[key].required;

    if (typeof schema[key].type === "function") {
      schema[key].type = schema[key].type.name.toLowerCase();
    }
    return prev;
  }, []);
}

/**
 * 从 ctx.request.files 中提取文件属性
 */
function getFileProperties(ctx: Context, key: string) {
  const { files } = ctx.request as any;
  const file = files ? files[key] : undefined;
  if (file) {
    const allowProps = [
      "hash",
      "lastModifiedDate",
      "name",
      "path",
      "size",
      "type",
    ];
    return JSON.stringify({
      fieldName: key,
      ...pick(file, allowProps),
    });
  }
}

/**
 * 格式化参数
 */
function prepareParams<T>(
  ctx: Context,
  type: keyof Parameters,
  schemas: Schema<T>,
  parameters: Params<T>
) {
  const schema = schemas[type];
  const params = parameters[type];
  Object.keys(schema).forEach((key: string) => {
    const type = schema[key] ? schema[key].type : null;

    // 如果是文件类型，从 request 中提取验证所需的字段和属性并转为 string, 供下一步的 ajv 验证器使用
    if (type === "file") {
      schema[key].type = "string";
      params[key] = getFileProperties(ctx, key);
    }

    // 将 string 类型的 "True", "False" 转为 boolean类型
    // 将 string 类型的 数字 转为 number 类型
    if (type && ["number", "boolean"].includes(type)) {
      if (typeof params[type] === "string") {
        params[key] = JSON.parse(params[key].toLowerCase());
      }
    }
  });
  return params;
}

async function validateByAJV(
  name: string,
  paramsType: string,
  params: Params<Object>,
  schema: Schema<Object>,
  parentData: any = {}
) {
  const requiresParams: string[] = getRequiredParamsName(schema);
  const wrappedSchema = {
    $async: true,
    type: "object",
    properties: schema,
    required: requiresParams,
  };

  const validate: any = ajv.compile(wrappedSchema);

  return new Promise((resolve) => {
    validate(params, {
      dataPath: name,
      parentData: parentData,
      parentDataProperty: paramsType,
      dynamicAnchors: {},
      rootData: parentData,
    })
      .then(() => {
        resolve(null);
      })
      .catch((err: any) => {
        let errors: any = null;
        if (err.errors) {
          errors = err.errors.map((e: any) => {
            const picked = pick(e, [
              "keyword",
              "message",
              "data",
              "params",
              "dataPath",
              "paramsType",
            ]);
            update(picked, "dataPath", (v: any) => v.replace(/\//g, "."));
            picked.paramsType = paramsType;
            return picked;
          });
        }
        resolve(errors);
      });
  });
}

export default async function KoaParamsValidator(
  ctx: Context,
  target: any,
  name: string
): Promise<any> {
  const schemas: Schema<Parameters> = cloneDeep(target[name].parameters) || {};
  const parameters: Parameters = {
    header: ctx.headers,
    path: ctx.params,
    query: ctx.query,
    body: (ctx.request as any).body,
    formData: (ctx.request as any).body,
  };

  let errors = await Promise.all(
    Object.keys(schemas).map((type) => {
      if (parameters[type]) {
        const params = prepareParams<Parameters>(
          ctx,
          type as any,
          schemas,
          parameters
        );
        return (
          validateByAJV(
            `${target.name}.${name}(ctx.${type}) => ${type}`,
            type,
            params,
            schemas[type],
            parameters
          ) || null
        );
      } else {
        return null;
      }
    })
  );
  errors = errors.filter((e) => e !== null);

  return errors.length === 0 ? null : errors;
}
