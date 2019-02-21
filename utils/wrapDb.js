/**
 * Wraps a level db instance to provide custom behaviour
 * This db will contain integers and strings, no objects or arrays
 */
function wrapDb(db) {
  function correctKey(key) {
    if (!key) throw Error("key is not defined");
    return key.toLowerCase();
  }

  /**
   * Returns value at key parsed
   * @param {String} key
   */
  function get(key) {
    key = correctKey(key);
    return db.get(key).catch(err => {
      if (err.message.includes("Key not found")) return null;
      else throw err;
    });
  }

  /**
   * Set value at key after stringifying
   * @param {String} key
   * @param {String} data
   */
  function set(key, data) {
    key = correctKey(key);
    return db.put(key, data);
  }

  /**
   * Assume the value of this key is a comma separated value (CSV) list of shortcodes:
   *   07472,4831,0053882,48244,42445
   * Append the val param to the end
   * @param {String} key
   * @param {String} val
   */
  async function append(key, val) {
    key = correctKey(key);
    const prevCsv = await get(key);
    const csv = prevCsv ? prevCsv + "," + val : val;
    return await set(key, csv);
  }

  /**
   * Assume the value of this key is an integer counter
   * Increase it by 1 every time this method is called
   * @param {String} key
   */
  async function increment(key) {
    key = correctKey(key);
    const prevCounter = await get(key);
    const counter = prevCounter ? parseInt(prevCounter, 10) + 1 : 1;
    return await set(key, String(counter));
  }

  /**
   * Delete
   */
  async function deleteList(key) {
    key = correctKey(key);
    const scString = await get(key);
    if (!scString) return; // If there are no shortcodes registered, abort
    const scList = [...scString.split(","), key];
    await db.batch(scList.map(sc => ({ type: "del", key: sc })));
  }

  return {
    get,
    set,
    append,
    increment,
    deleteList,
    open: db.open.bind(db),
    close: db.close.bind(db)
  };
}

module.exports = wrapDb;
