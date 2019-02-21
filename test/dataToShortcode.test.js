const expect = require("chai").expect;
const getKey = require("../utils/getKey");

let _db = {};

const db = {
  get: async key => _db[key],
  append: async (key, val) => {
    _db[key] = _db[key] ? _db[key] + "," + val : val;
  },
  increment: async key => {
    _db[key] = _db[key] ? _db[key] + 1 : 1;
  },
  set: async (key, val) => {
    _db[key] = val;
  }
};

const timeWindow = 100000000000;
const timeSlot = Math.floor(Date.now() / timeWindow);
const countKey = getKey.count(timeSlot);
const listKey = getKey.list(timeSlot);

const options = {
  minDigits: 2,
  timeWindow
};

const dataToShortcode = require("../utils/dataToShortcode")(db, options);

describe("Util: dataToShortcode", () => {
  // pass a HUGE timewindow to prevent false test errors
  // The test may break if run on Sunday, September 13, 2020 12:26:40 PM GMT

  beforeEach(() => {
    _db = {};
  });

  it("should return a 2 digits shortcode", async () => {
    const id = await dataToShortcode("some data");
    expect(id.length).to.equal(2, "Wrong sc length");
    expect(_db[countKey]).to.equal(1, "Wrong count");
    expect(_db[listKey].split(",").length).to.equal(1, "Wrong sc list");
  });
  it("should return a 4 digits shortcode after some spam", async () => {
    let id;
    for (let i = 0; i < 1000; i++) {
      id = await dataToShortcode("some data");
    }
    expect(id.length).to.equal(4, "Wrong sc length");
    expect(_db[countKey]).to.equal(1000, "Wrong count");
    expect(_db[listKey].split(",").length).to.equal(1000, "Wrong sc list");
  });
});
