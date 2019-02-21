//During the test the env variable is set to test
process.env.NODE_ENV = "test";
const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const server = require("../server");

describe("Server integration test", () => {
  describe("Default index page", () => {
    it("should return a default html", async () => {
      const res = await chai.request(server).get("/");

      expect(res).to.have.status(200);
      expect(res).to.be.html;
      expect(res.text).to.include("Swarm City shortcode service");
    });
  });

  const data = {
    publicKey: "0x7297342934234g2y3g4uy2g3u4y2g3u4yg2u34"
  };
  let shortcode;

  describe("Register POST", () => {
    it("should accept a post request to store params", async () => {
      const res = await chai
        .request(server)
        .post("/")
        .type("text")
        .send(JSON.stringify(data));

      if (res.error) console.log(res.error);
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      shortcode = res.body.shortcode;
      expect(shortcode).to.be.ok;
      expect(shortcode).to.be.a("string");
      expect(shortcode.length).to.equal(5);
    });

    it("should retrieve a data of a shortcode", async () => {
      const res = await chai.request(server).get(`/${shortcode}`);

      if (res.error) console.log(res.error);
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      const _data = JSON.parse(res.body);
      expect(_data).to.be.a("object");
      expect(_data).to.deep.equal(data);
    });

    it("should return error retrieving an unkown id", async () => {
      const res = await chai.request(server).get(`/missing-shortcode`);

      expect(res).to.have.status(404);
      expect(res).to.be.html;
      expect(res.text).to.include("Shortcode not found");
    });
  });
});
