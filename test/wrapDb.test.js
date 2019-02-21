const expect = require("chai").expect;
const db = require("../utils/db");

describe("Util: wrapDb", () => {
  const shortcode = String(Date.now());
  const data = "short code data";

  it("should add and retrieve a shortcode", async () => {
    await db.set(shortcode, data);
    expect(await db.get(shortcode)).to.equal(data, "data should be equal");
  });

  it("should increment the counter two times", async () => {
    const counterKey = `counterKey-${shortcode}`;
    expect(await db.get(counterKey)).to.equal(null, "not initialized");
    await db.increment(counterKey);
    expect(await db.get(counterKey)).to.equal("1", "first time");
    await db.increment(counterKey);
    expect(await db.get(counterKey)).to.equal("2", "second time");
  });

  it("should append to csv two times", async () => {
    const listKey = `listKey-${shortcode}`;
    const firstString = "01";
    const secondString = "02";
    expect(await db.get(listKey)).to.equal(null, "not initialized");
    await db.append(listKey, firstString);
    expect(await db.get(listKey)).to.equal("01", "first time");
    await db.append(listKey, secondString);
    expect(await db.get(listKey)).to.equal("01,02", "second time");
  });

  it("should delete a list using a batch request", async () => {
    const listKey = `shortcode-list-${shortcode}`;
    const scKeys = ["0001", "0002", "0003", "0004"];
    const scData = "some-data";
    for (const sc of scKeys) {
      await db.set(sc, scData);
      expect(await db.get(sc)).to.equal(scData, `Wrong data in sc ${sc}`);
    }
    await db.set(listKey, [...scKeys, "fake"].join(","));
    await db.deleteList(listKey);
    for (const sc of scKeys) {
      expect(await db.get(sc)).to.equal(null, `sc ${sc} was not deleted`);
    }
    expect(await db.get(listKey)).to.equal(null, `sc list was not deleted`);
  });
});
