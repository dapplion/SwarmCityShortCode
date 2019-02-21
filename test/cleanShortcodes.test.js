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
  },
  deleteList: async key => {
    delete _db[key];
  }
};

const timeWindow = 1000 * 1000;
_db = {
  [getKey.list(1550780)]: "some short codes",
  [getKey.list(1550783)]: "more short codes",
  [getKey.list(1550784)]: "even more short codes"
};

const options = {
  timeWindow
};

const cleanShortcodes = require("../utils/cleanShortcodes")(db, options);

describe("Util: cleanShortcodes", () => {
  it("should remove all shortcodes", async () => {
    await cleanShortcodes();
    expect(_db).to.deep.equal({}, "should have deleted all lists");
  });
});
