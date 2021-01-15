import Ajv from "ajv";
import { mimesDefinition, mimesSchema } from "./keyword.mimes";
import { maxResolution, maxResolutionDefinition } from "./keyword.resolution";
import { maxSizeSchema, maxSizeDefinition } from "./keyword.size";
import binaryFormats from "./formats";
import { extnameDefinition, extnameSchema } from "./keyword.extnames";

export const metaSchema = {
  type: "object",
  properties: {
    extnames: extnameSchema,
    mimes: mimesSchema,
    maxResolution,
    maxSize: maxSizeSchema,
  },
};

export interface ImageOptions {}
export function useImage(ajv: Ajv, options?: ImageOptions) {
  Object.keys(binaryFormats).forEach((name) => {
    ajv.addFormat(name, binaryFormats[name]);
  });

  ajv.addKeyword(maxSizeDefinition);
  ajv.addKeyword(maxResolutionDefinition);
  ajv.addKeyword(mimesDefinition);
  ajv.addKeyword(extnameDefinition);
}
