// import * as request from 'supertest';
import fs from "fs";
import path from "path";
import { expect } from "chai";
import { Response } from "node-fetch";
import faker from "faker";
import FormData from "form-data";
import {
  createTestRequestClient,
  TestRequestOptions,
} from "../helpers/test-fetch";
import setup from "../setup";

function readFile(file: string): fs.ReadStream {
  const filepath = path.resolve(__dirname, file);
  return fs.createReadStream(filepath);
}

describe("Validation/setup", () => {
  let request: (config: TestRequestOptions) => Promise<Response>;
  before(async () => {
    request = await createTestRequestClient(setup);
  });

  describe("Validate size of upload files", () => {
    it("Should be ok with size < 2M", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.png");
      formData.append("xyz", "XYZ");
      formData.append("file", readFile("../supports/imgs/size-2M.png"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/size/2m`,
        headers: {
          // "content-type": "multipart/form-data",
        },
        body: formData,
      });
      expect(response.status).to.equals(200);
      expect((await response.json()).data).to.equals("ok");
    });

    it("Should be failed with size > 2M", async () => {
      const formData = new FormData();
      // formData.append("fileName", "abc/xyz/asd.png");
      formData.append("file", readFile("../supports/imgs/size-5M.png"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/size/2m`,
        headers: {
          // "content-type": "multipart/form-data",
        },
        body: formData,
      });
      expect(response.status).to.equals(400);
    });
  });

  describe("Validate mime type of upload files", () => {
    it("Uploading image with mime type image/png should be ok ", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.png");
      formData.append("xyz", "XYZ");
      formData.append("file", readFile("../supports/imgs/size-1M.png"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/mimes/png`,
        body: formData,
      });
      expect(response.status).to.equals(200);
      // expect((await response.json()).data).to.equals("ok");
    });

    it("Uploading image with mime type image/jpg should not be ok ", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.jpg");
      formData.append("file", readFile("../supports/imgs/ext.jpg"));

      const response = await request({
        method: "POST",
        url: "/validate/file/image/mimes/png",
        body: formData,
      });
      expect(response.status).to.equals(400);
    });
  });

  describe("Validate extnames of upload files", () => {
    it("Uploading image with extnames *.png should be ok ", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.png");
      formData.append("file", readFile("../supports/imgs/ext.png"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/exts/png`,
        body: formData,
      });
      expect(response.status).to.equals(200);
    });
    it("Uploading image with extnames *.jpg should be ok ", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.jpg");
      formData.append("file", readFile("../supports/imgs/ext.jpg"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/exts/jpg`,
        body: formData,
      });
      expect(response.status).to.equals(200);
    });
    it("Uploading image with extnames *.png should be ok", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.png");
      formData.append("file", readFile("../supports/imgs/ext.png"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/exts/png-jpeg`,
        body: formData,
      });
      expect(response.status).to.equals(200);
    });
    it("Uploading image with extnames *.jpeg should be ok ", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.jpeg");
      formData.append("file", readFile("../supports/imgs/ext.jpeg"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/exts/png-jpeg`,
        body: formData,
      });
      expect(response.status).to.equals(200);
    });

    // Not allowed
    it("Uploading image with extnames *.gif should not be ok ", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.gif");
      formData.append("file", readFile("../supports/imgs/ext.gif"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/exts/png`,
        body: formData,
      });
      expect(response.status).to.equals(400);
    });
    it("Uploading image with extnames *.png should not be ok ", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.png");
      formData.append("file", readFile("../supports/imgs/ext.png"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/exts/jpg`,
        body: formData,
      });
      expect(response.status).to.equals(400);
    });
    it("Uploading image with extnames *.gif should not be ok", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.gif");
      formData.append("file", readFile("../supports/imgs/ext.gif"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/exts/png-jpeg`,
        body: formData,
      });
      expect(response.status).to.equals(400);
    });
    it("Uploading image with extnames *.gif should not be ok ", async () => {
      const formData = new FormData();
      formData.append("fileName", "abc/xyz/asd.gif");
      formData.append("file", readFile("../supports/imgs/ext.gif"));

      const response = await request({
        method: "POST",
        url: `/validate/file/image/exts/png-jpeg`,
        body: formData,
      });
      expect(response.status).to.equals(400);
    });
  });
});
