// import * as request from 'supertest';
import { expect } from "chai";
import { Response } from "node-fetch";
import faker from "faker";
import {
  createTestRequestClient,
  TestRequestOptions,
} from "../helpers/test-fetch";
import setup from "../setup";

describe("Test validate", () => {
  let request: (config: TestRequestOptions) => Promise<Response>;
  before(async () => {
    request = await createTestRequestClient(setup);
  });

  describe("Params in path validate", () => {
    it("Should be ok with uuid params", async () => {
      const id = faker.random.uuid();
      const response = await request({
        method: "GET",
        url: `/validate/get/${id}`,
      });
      expect(response.status).to.equals(200);
      expect((await response.json()).data).to.equals("ok");
    });

    it("Should be failed with an invalided uuid params", async () => {
      const id = "id-invalided-uuid";
      const response = await request({
        method: "GET",
        url: `/validate/get/${id}`,
      });
      expect(response.status).to.equals(400);
    });
  });

  describe("Post validate", () => {
    it("Should be ok with valide JSON", async () => {
      const response = await request({
        method: "POST",
        url: `/validate/post`,
        data: {
          username: "Colin",
          password: "Colin98765",
        },
      });
      expect(response.status).to.equals(200);
      expect((await response.json()).data).to.equals("ok");
    });

    it("Should be failed with an invalided JSON.", async () => {
      const response = await request({
        method: "POST",
        url: `/validate/post`,
        data: {
          username: "Col",
          password: "length",
        },
      });
      expect(response.status).to.equals(400);
    });

    it("Should be failed with an invalided JSON.", async () => {
      const response = await request({
        method: "POST",
        url: `/validate/headers`,
        data: {
          username: "Col",
        },
      });
      expect(response.status).to.equals(400);
    });
  });

  describe("Header validate", () => {
    it("Should be ok with valide X-User header", async () => {
      const response = await request({
        method: "POST",
        url: `/validate/headers`,
        headers: {
          "X-User": faker.random.uuid(),
        },
      });
      expect(response.status).to.equals(200);
      expect((await response.json()).data).to.equals("ok");
    });

    it("Should be ok with case insensitive X-User header", async () => {
      const response = await request({
        method: "POST",
        url: `/validate/headers`,
        headers: {
          "x-UseR": faker.random.uuid(),
        },
      });
      expect(response.status).to.equals(200);
      expect((await response.json()).data).to.equals("ok");
    });

    it("Should be failed without X-User header.", async () => {
      const response = await request({
        method: "POST",
        url: `/validate/headers`,
      });
      expect(response.status).to.equals(400);
    });
  });
});
