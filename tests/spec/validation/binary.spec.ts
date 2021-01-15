import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { expect } from "chai";

import { metaSchema } from "../../../src/validator/binary";
import { extnameSchema } from "../../../src/validator/binary/keyword.extnames";
import { mimesSchema } from "../../../src/validator/binary/keyword.mimes";
import { maxResolution } from "../../../src/validator/binary/keyword.resolution";
import { maxSizeSchema } from "../../../src/validator/binary/keyword.size";

export const ajv = new Ajv({
  verbose: true,
  allErrors: true,
  validateFormats: true,
  allowUnionTypes: true,
}); // options can be passed, e.g. {allErrors: true}\

async function validate(
  schema: {
    [K in keyof typeof metaSchema.properties]?: typeof metaSchema.properties[K];
  },
  data: any
) {
  const validate: ValidateFunction = ajv.compile({
    type: "object",
    properties: schema,
  });
  return validate(data);
}

describe("Validate custom keywords definition: image.extnames", () => {
  const kw = "extnames";
  const schema = { [kw]: extnameSchema };
  const exts = [
    ".bmp",
    ".gif",
    ".jpg",
    ".jpeg",
    ".webp",
    ".png",
    ".svg",
    ".svgz",
    ".tiff",
    ".ico",
    ".mp4",
    ".js",
    ".css",
    ".zip",
    ".rar",
    ".tar",
    ".gz",
    ".7z",
  ];
  it("Regular file extnames should be allow.", async () => {
    const result = await validate(schema, { extnames: exts.join(",") });
    expect(result).to.equals(true);
  });

  it("Regular file extnames separate by comma(,) should be allow.", async () => {
    const result = await validate(schema, { extnames: exts.join(",") });
    expect(result).to.equals(true);
  });

  it("Regular file extnames separate by semicolon(;) should be allow.", async () => {
    const result = await validate(schema, { extnames: exts.join(";") });
    expect(result).to.equals(true);
  });

  it("Regular file extnames separate by vertical line(|) should be allow.", async () => {
    const result = await validate(schema, { extnames: exts.join("|") });
    expect(result).to.equals(true);
  });

  it("Regular file extnames without a dot prefix should not be allow.", async () => {
    const result = await validate(schema, { extnames: "bmp,png" });
    expect(result).to.equals(false);
  });

  it("Unknown file extnames should not be allow.", async () => {
    const result = await validate(schema, { extnames: ".a=sd" });
    expect(result).to.equals(false);

    const result1 = await validate(schema, { extnames: ".a$sd,fs@d" });
    expect(result1).to.equals(false);
  });

  it("Single file extnames should be allow.", async () => {
    const result = await validate(schema, { extnames: ".png" });
    expect(result).to.equals(true);

    const result1 = await validate(schema, { extnames: ".jpeg" });
    expect(result1).to.equals(true);
  });

  it("Regular file extnames of array should be allow.", async () => {
    const result = await validate(schema, { extnames: exts });
    expect(result).to.equals(true);
  });

  it("Regular file extnames of array should be allow.", async () => {
    const result = await validate(schema, {
      extnames: [".jpg", ".png", ".webp"],
    });
    expect(result).to.equals(true);
  });

  it("Regular file extnames of array without dot prefix should not be allow.", async () => {
    const result = await validate(schema, {
      extnames: ["jpg", "png", "webp"],
    });
    expect(result).to.equals(false);
  });

  it("Regular file extnames of array without dot and * prefix should be allow.", async () => {
    const result = await validate(schema, {
      extnames: ["*.jpg", "*.png", "*.webp"],
    });
    expect(result).to.equals(true);
  });
});

describe("Validate custom keywords definition: image.mimes", () => {
  const kw = "mimes";
  const schema = { [kw]: mimesSchema };
  const all = [
    "application/atom+xml",
    "application/java-archive",
    "application/javascript",
    "application/json",
    "application/msword",
    "application/octet-stream",
    "application/pdf",
    "application/postscript",
    "application/rss+xml",
    "application/rtf",
    "application/vnd.apple.mpegurl",
    "application/vnd.google-earth.kml+xml",
    "application/vnd.google-earth.kmz",
    "application/vnd.ms-excel",
    "application/vnd.ms-fontobject",
    "application/vnd.ms-powerpoint",
    "application/vnd.oasis.opendocument.graphics",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/x-7z-compressed",
    "application/x-perl",
    "application/x-tcl",
    "application/xhtml+xml",
    "application/zip",
    "audio/midi",
    "audio/mpeg",
    "audio/ogg",
    "audio/x-m4a",
    "audio/x-realaudio",
    "font/woff",
    "font/woff2",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/vnd.wap.wbmp",
    "image/webp",
    "image/x-icon",
    "image/x-jng",
    "image/x-ms-bmp",
    "text/css",
    "text/html",
    "text/plain",
    "text/x-component",
    "text/xml",
    "video/3gpp",
    "video/mp2t",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/webm",
    "video/x-flv",
    "video/x-m4v",
    "video/x-mng",
    "video/x-ms-wmv",
    "video/x-msvideo",
  ];

  it("Multiple mimetypes of array should be allow.", async () => {
    const result = await validate(schema, { [kw]: all });
    expect(result).to.equals(true);
  });

  it("Multiple mimetypes of array within invalided mimetype should not be allow.", async () => {
    const result = await validate(schema, {
      [kw]: all.concat("invalided/xyz"),
    });
    expect(result).to.equals(false);
  });

  it("Regular mimetypes should be allow.", async () => {
    const result = await validate(schema, { [kw]: all.join(";") });
    expect(result).to.equals(true);
  });

  it("Regular mimetypes separate by semicolon(;) should be allow.", async () => {
    const result = await validate(schema, { [kw]: all.join(";") });
    expect(result).to.equals(true);
  });

  it("Regular mimetypes separate by comma(,) should be allow.", async () => {
    const result = await validate(schema, { [kw]: all.join(";") });
    expect(result).to.equals(true);
  });

  it("Regular mimetypes separate by vertical line(|) should be allow.", async () => {
    const result = await validate(schema, { [kw]: all.join("|") });
    expect(result).to.equals(true);
  });

  it("Single regular mimetypes should be allow.", async () => {
    const result0 = await validate(schema, { [kw]: all[0] });
    expect(result0).to.equals(true);
    const result1 = await validate(schema, { [kw]: all[1] });
    expect(result1).to.equals(true);
    const result2 = await validate(schema, { [kw]: all[2] });
    expect(result2).to.equals(true);
    const result3 = await validate(schema, { [kw]: all[3] });
    expect(result3).to.equals(true);
  });

  it("Single unknown mimetypes should not be allow.", async () => {
    const result0 = await validate(schema, { [kw]: "bad/unknown" });
    expect(result0).to.equals(false);

    const result1 = await validate(schema, { [kw]: "horse/json" });
    expect(result1).to.equals(false);

    const result2 = await validate(schema, { [kw]: "hill/html" });
    expect(result2).to.equals(false);
  });

  it("Unknown mimetypes should not be allow.", async () => {
    const result = await validate(schema, {
      [kw]: "table/sdsadas,image/png",
    });
    expect(result).to.equals(false);

    const result1 = await validate(schema, {
      [kw]: ["desktop/json", "xyztext/xhtml"],
    });
    expect(result1).to.equals(false);

    const result2 = await validate(schema, { [kw]: "abc/html;def/plain;" });
    expect(result2).to.equals(false);
  });
});

describe("Validate custom keywords definition: image.maxResolution", () => {
  const kw = "maxResolution";
  const schema = { [kw]: maxResolution };
  it("Numeric resolution should be allow.", async () => {
    const result = await validate(schema, { [kw]: 1024 });
    expect(result).to.equals(true);
  });

  it("String single resolution without unit should be allow.", async () => {
    const result = await validate(schema, { [kw]: "1024" });
    expect(result).to.equals(true);
  });

  it("String single resolution with unit `px/PX` should be allow.", async () => {
    const result = await validate(schema, { [kw]: "1024px" });
    expect(result).to.equals(true);

    const result1 = await validate(schema, { [kw]: "1024PX" });
    expect(result1).to.equals(true);
  });

  it("String resolution separate by (xX*,) without unit should be allow.", async () => {
    const result = await validate(schema, { [kw]: "1024,768" });
    expect(result).to.equals(true);
    const result1 = await validate(schema, { [kw]: "1024x768" });
    expect(result1).to.equals(true);
    const result2 = await validate(schema, { [kw]: "1024X768" });
    expect(result2).to.equals(true);
    const result3 = await validate(schema, { [kw]: "1024*768" });
    expect(result3).to.equals(true);
    const result4 = await validate(schema, { [kw]: "1024 , 768" });
    expect(result4).to.equals(true);
    const result5 = await validate(schema, { [kw]: "1024 x 768" });
    expect(result5).to.equals(true);
    const result6 = await validate(schema, { [kw]: "1024 X 768" });
    expect(result6).to.equals(true);
    const result7 = await validate(schema, { [kw]: "1024 * 768" });
    expect(result7).to.equals(true);
    const result8 = await validate(schema, { [kw]: "1024* 768" });
    expect(result8).to.equals(true);
    const result9 = await validate(schema, { [kw]: "1024 *768" });
    expect(result9).to.equals(true);
  });

  it("String resolution separate by (xX*,) with unit `px|PX` should be allow.", async () => {
    const result = await validate(schema, { [kw]: "1024px,768px" });
    expect(result).to.equals(true);
    const result1 = await validate(schema, { [kw]: "1024px x 768px" });
    expect(result1).to.equals(true);
    const result2 = await validate(schema, { [kw]: "1024PX X 768PX" });
    expect(result2).to.equals(true);
    const result3 = await validate(schema, { [kw]: "1024px*768px" });
    expect(result3).to.equals(true);
    const result4 = await validate(schema, { [kw]: "1024px , 768px" });
    expect(result4).to.equals(true);
    const result5 = await validate(schema, { [kw]: "1024px x 768px" });
    expect(result5).to.equals(true);
    const result6 = await validate(schema, { [kw]: "1024px X 768px" });
    expect(result6).to.equals(true);
    const result7 = await validate(schema, { [kw]: "1024px * 768px" });
    expect(result7).to.equals(true);
    const result8 = await validate(schema, { [kw]: "1024px* 768px" });
    expect(result8).to.equals(true);
    const result9 = await validate(schema, { [kw]: "1024px *768px" });
    expect(result9).to.equals(true);
  });

  it("String resolution with unit `px/PX` should be allow.", async () => {
    const result = await validate(schema, { [kw]: "1024px" });
    expect(result).to.equals(true);

    const result1 = await validate(schema, { [kw]: "1024PX" });
    expect(result1).to.equals(true);
  });

  it("number[] of resolution should be allow.", async () => {
    const result = await validate(schema, { [kw]: [1024, 768] });
    expect(result).to.equals(true);
  });

  it("string[] of resolution without unit should be allow.", async () => {
    const result = await validate(schema, { [kw]: ["1024", "768"] });
    expect(result).to.equals(true);
  });

  it("string[] of resolution with unit `px/PX` should be allow.", async () => {
    const result = await validate(schema, { [kw]: ["1024px", "768px"] });
    expect(result).to.equals(true);
    const result1 = await validate(schema, { [kw]: ["1024px", "768PX"] });
    expect(result1).to.equals(true);
    const result2 = await validate(schema, { [kw]: ["1024PX", "768px"] });
    expect(result2).to.equals(true);
    const result3 = await validate(schema, { [kw]: ["1024PX", "768PX"] });
    expect(result3).to.equals(true);
  });
});

describe("Validate custom keywords definition: image.maxSize", () => {
  const kw = "maxSize";
  const $ = { [kw]: maxSizeSchema };
  it("Numeric size (default unit bite) should be allow.", async () => {
    const result = await validate($, { [kw]: 1024 });
    expect(result).to.equals(true);
  });
  it("Numeric size < 0 should not be allow.", async () => {
    const result = await validate($, { [kw]: -1024 });
    expect(result).to.equals(false);
  });
  it("String size without unit (default unit bite) should be allow.", async () => {
    const result = await validate($, { [kw]: "1024B" });
    expect(result).to.equals(true);
    const result1 = await validate($, { [kw]: "1024b" });
    expect(result1).to.equals(true);
  });
  it("String size with a case insensitive unit `B` should be allow.", async () => {
    const result = await validate($, { [kw]: "1024B" });
    expect(result).to.equals(true);
    const result1 = await validate($, { [kw]: "1024b" });
    expect(result1).to.equals(true);
  });
  it("String size with a case insensitive unit `MB` should be allow.", async () => {
    const result = await validate($, { [kw]: "1024MB" });
    expect(result).to.equals(true);
    const result1 = await validate($, { [kw]: "1024Mb" });
    expect(result1).to.equals(true);
    const result2 = await validate($, { [kw]: "1024mb" });
    expect(result2).to.equals(true);
  });
  it("String size with a case insensitive unit `GB` should be allow.", async () => {
    const result = await validate($, { [kw]: "1024GB" });
    expect(result).to.equals(true);
    const result1 = await validate($, { [kw]: "1024Gb" });
    expect(result1).to.equals(true);
    const result2 = await validate($, { [kw]: "1024gb" });
    expect(result2).to.equals(true);
  });
  it("String size with a case insensitive unit `TB` should be allow.", async () => {
    const result = await validate($, { [kw]: "1024TB" });
    expect(result).to.equals(true);
    const result1 = await validate($, { [kw]: "1024Tb" });
    expect(result1).to.equals(true);
    const result2 = await validate($, { [kw]: "1024tb" });
    expect(result2).to.equals(true);
  });
  it("String size with a case insensitive unit `PB` should be allow.", async () => {
    const result = await validate($, { [kw]: "1024PB" });
    expect(result).to.equals(true);
    const result1 = await validate($, { [kw]: "1024Pb" });
    expect(result1).to.equals(true);
    const result2 = await validate($, { [kw]: "1024pb" });
    expect(result2).to.equals(true);
  });

  it("String size with a case insensitive unit `M` should be allow.", async () => {
    const result = await validate($, { [kw]: "1024M" });
    expect(result).to.equals(true);
    const result2 = await validate($, { [kw]: "1024m" });
    expect(result2).to.equals(true);
  });
  it("String size with a case insensitive unit `GB` should be allow.", async () => {
    const result1 = await validate($, { [kw]: "1024G" });
    expect(result1).to.equals(true);
    const result2 = await validate($, { [kw]: "1024g" });
    expect(result2).to.equals(true);
  });
  it("String size with a case insensitive unit `TB` should be allow.", async () => {
    const result1 = await validate($, { [kw]: "1024T" });
    expect(result1).to.equals(true);
    const result2 = await validate($, { [kw]: "1024t" });
    expect(result2).to.equals(true);
  });
  it("String size with a case insensitive unit `PB` should be allow.", async () => {
    const result1 = await validate($, { [kw]: "1024P" });
    expect(result1).to.equals(true);
    const result2 = await validate($, { [kw]: "1024p" });
    expect(result2).to.equals(true);
  });
  it("String size with invalided units should not be allow.", async () => {
    const result = await validate($, { [kw]: "1024px" });
    expect(result).to.equals(false);
    const result1 = await validate($, { [kw]: "1024pt" });
    expect(result1).to.equals(false);
    const result2 = await validate($, { [kw]: "1024vw" });
    expect(result2).to.equals(false);
    const result3 = await validate($, { [kw]: "1024x" });
    expect(result3).to.equals(false);
    const result4 = await validate($, { [kw]: "1024y" });
    expect(result4).to.equals(false);
  });

  it("String size with float number should be allow.", async () => {
    expect(await validate($, { [kw]: "5M" })).to.equals(true);
    expect(await validate($, { [kw]: "50000000b" })).to.equals(true);
    expect(await validate($, { [kw]: "50000000Pb" })).to.equals(true);
    expect(await validate($, { [kw]: "0.5M" })).to.equals(true);
    expect(await validate($, { [kw]: "1.5M" })).to.equals(true);
    expect(await validate($, { [kw]: "231.5Mb" })).to.equals(true);
    expect(await validate($, { [kw]: "23123.5" })).to.equals(true);
    expect(await validate($, { [kw]: "1.035Gb" })).to.equals(true);
    expect(await validate($, { [kw]: "239.8374Gb" })).to.equals(true);
    expect(await validate($, { [kw]: "239.8374G" })).to.equals(true);
    expect(await validate($, { [kw]: "0.12876PB" })).to.equals(true);
    expect(await validate($, { [kw]: "0.12876P" })).to.equals(true);
  });

  it("String size with negative number should not be allow.", async () => {
    expect(await validate($, { [kw]: "-5M" })).to.equals(false);
    expect(await validate($, { [kw]: "-50000000b" })).to.equals(false);
    expect(await validate($, { [kw]: "-50000000Pb" })).to.equals(false);
    expect(await validate($, { [kw]: "-0.5M" })).to.equals(false);
    expect(await validate($, { [kw]: "-1.5M" })).to.equals(false);
    expect(await validate($, { [kw]: "-231.5Mb" })).to.equals(false);
    expect(await validate($, { [kw]: "-23123.5" })).to.equals(false);
    expect(await validate($, { [kw]: "-1.035Gb" })).to.equals(false);
    expect(await validate($, { [kw]: "-239.8374Gb" })).to.equals(false);
    expect(await validate($, { [kw]: "-239.8374G" })).to.equals(false);
    expect(await validate($, { [kw]: "-0.12876PB" })).to.equals(false);
    expect(await validate($, { [kw]: "-0.12876P" })).to.equals(false);
  });
});
