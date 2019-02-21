function shortcodeToDataFactory(db) {
  if (!db || typeof db !== "object")
    throw Error("db must be defined and an object");

  /**
   * Returns a previously generated shortcode
   * @param {String} shortcode
   */
  return async function shortcodeToData(shortcode) {
    const data = await db.get(shortcode);
    return data;
  };
}

module.exports = shortcodeToDataFactory;
