import chalk from "chalk";
import { Server } from "http";
import { omit } from "lodash";
import fetch, { Headers, RequestInit, Response } from "node-fetch";

type ConfigTestContext =
  | TestContext
  | Promise<TestContext>
  | (() => TestContext)
  | (() => Promise<TestContext>);

export interface TestContext {
  server: Server;
  host: string;
  meta?: { [k: string]: any };
}

export interface TestRequestOptions extends RequestInit {
  context?: ConfigTestContext;
  url: string;
  baseURL?: string;
  data?: any;
}

async function resolveContext(ctx: ConfigTestContext): Promise<TestContext> {
  if (typeof ctx === "function") {
    return ctx();
  } else {
    return ctx;
  }
}

/**
 * 虚线框包装文字
 * @param text
 */
function outputWrapper(text: string) {
  let lines = text.split(/[\r\n]/g);
  const width = Math.min(
    lines.reduce((a, b) => (a.length > b.length ? a : b), "").length,
    100
  );
  const indent = "          ";
  const top: string = `\n${indent}╭${"┈".repeat(width + 4)}╮\n`;
  const bottom: string = `\n${indent}╰${"┈".repeat(width + 4)}╯\n`;
  const wrap = [indent + "┆  ", "  ┆"];

  lines = lines.map((line) => {
    const len = line.length;
    line = len > width ? line.substring(0, width - 4) + " ..." : line;
    return `${wrap[0]}${line}${" ".repeat(Math.max(width - len, 0))}${wrap[1]}`;
  });

  const content = lines.join("\n");

  return [top, content, bottom].join("");
}

let context: TestContext | undefined;
export async function createTestRequestClient(ctx: ConfigTestContext) {
  context = await resolveContext(ctx);

  return request;
}

/**
 * HTTP 请求
 * @param config
 */
export async function request(config: TestRequestOptions): Promise<Response> {
  const ctx = config.context ? await resolveContext(config.context) : context;
  const baseURL = ctx ? ctx.host : config.baseURL;
  const url = `${baseURL}${config.url}`;
  const headers = {
    ...(config.headers || {}),
    "Content-Type": "application/json",
    // "x-internal-user": creatorId,
  };
  const options: RequestInit = {
    ...omit(config, ["headers", "data", "body", "url", "baseURL"]),
    headers: new Headers(headers),
    body: JSON.stringify(config.data || config.body),
  };

  const res = fetch(url, options).then(async (res) => {
    if (res.status !== 200) {
      console.warn(
        chalk.yellow(res.status),
        chalk.bold(chalk.cyan(config.method)),
        chalk.bold(chalk.cyan(config.url)),
        "\n" +
          chalk.grey(outputWrapper(JSON.stringify(await res.json(), null, 4)))
      );
    }
    return res;
  });

  res.catch((err) => {
    console.error(
      "REQUEST ERROR",
      chalk.bold(chalk.cyan(config.url)),
      "\n",
      chalk.red(JSON.stringify(err, null, 4))
    );
  });
  return res;
}
