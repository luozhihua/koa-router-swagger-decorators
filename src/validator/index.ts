import { Context } from "koa";
import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import * as addKeywords from "ajv-keywords";
import { HttpStatusError } from "../utils";
import { pick, update } from "lodash";

// interface Schema {
//   [k: string]: any;
// }

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
 *
 */
function parseParams<T>(schema: Schema<T>, params: Params<T>) {
  Object.keys(params).forEach((key: string) => {
    const type = schema[key] ? schema[key].type : null;
    if (type && ["number", "boolean"].includes(type)) {
      try {
        params[key] = JSON.parse(params[key].toLowerCase());
      } catch (err) {}
    }
  });
  return params;
}

export const ajv = new Ajv({
  verbose: true,
  allErrors: true,
  validateFormats: true,
}); // options can be passed, e.g. {allErrors: true}\

addFormats(ajv, { mode: "fast", keywords: true });
addKeywords.default(ajv);

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
    typeof data === "boolean" || ["true", "false"].includes(data.toLowerCase()),
  errors: true,
});

async function validateByAJV(
  name: string,
  paramsType: string,
  params: Params<Object>,
  schema: Schema<Object>
) {
  const schemaCopy = JSON.parse(JSON.stringify(schema));
  const requiresParams: string[] = getRequiredParamsName(schemaCopy);
  const wrappedSchema = {
    $async: true,
    type: "object",
    properties: schemaCopy,
    required: requiresParams,
  };

  params = parseParams(schema, params);

  const validate: any = ajv.compile(wrappedSchema);

  return new Promise((resolve) => {
    validate(params, {
      dataPath: name,
      parentData: {},
      parentDataProperty: "",
      dynamicAnchors: {},
      rootData: params,
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
  const { parameters: schemas = {} } = target[name];
  const parameters: any = {
    header: ctx.headers,
    path: ctx.params,
    query: ctx.query,
    body: (ctx.request as any).body,
    formData: (ctx.request as any).body,
  };

  let errors = await Promise.all(
    Object.keys(schemas).map((type) => {
      if (parameters[type]) {
        return (
          validateByAJV(
            `${target.name}.${name}(ctx.${type}) => ${type}`,
            type,
            parameters[type],
            schemas[type]
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
