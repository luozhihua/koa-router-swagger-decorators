"use strict";
import { expect } from "chai";
import {
  createTestRequestClient,
  TestRequestOptions,
} from "../helpers/test-fetch";
import setup from "../setup";
import { Response } from "node-fetch";

describe("health/setup", async () => {
  let request: (config: TestRequestOptions) => Promise<Response>;
  before(async () => {
    request = await createTestRequestClient(setup);
  });

  describe("health", async () => {
    it("Check fs service is ready.", async () => {
      const res = await request({
        method: "GET",
        url: "/health/ready",
      });
      expect(res?.status).equal(200);
      expect(1).equal(1);
    });

    it("Check fs service is alive.", async () => {
      const res = await request({
        method: "GET",
        url: "/health/alive",
      });
      expect(res?.status).equal(200);
    });
  });
});
