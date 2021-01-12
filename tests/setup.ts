import { Server } from "http";
import { start } from "./supports/app/app";
import chalk from "chalk";

export interface Context {
  server: Server;
  host: string;
  // user?: Commons.TestUser;
}
const log = console.log;
let context: Context;
const ready: Promise<Context> = new Promise(async (resolve, reject) => {
  try {
    const server = start();
    const addr: any = server.address();
    // // const user = await Commons.createTestUser(server);
    context = {
      server,
      host: `http://127.0.0.1:${addr.port}`,
    };
    resolve(context);
  } catch (err) {
    reject(err);
  }
});

before(async () => {
  log("⚙ #=", chalk.blue("Mocha setups..."), "======================");
  await ready;
  log("🚀 #=", chalk.yellow("Running tests..."), "====================");
});

after(async () => {
  log("🚿 #=", chalk.yellow("Cleaning data..."), "===================");
  await Promise.all([]).finally(async () => {
    context.server.close();
    log("🏆 #=", chalk.green("Completed!!!"), "=======================");
  });
});

export default ready;
