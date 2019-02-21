const getKey = require("./getKey");

function dataToShortcodeFactory(db, { minDigits, timeWindow } = {}) {
  if (!db || typeof db !== "object")
    throw Error("db must be defined and an object");
  if (!minDigits || isNaN(minDigits))
    throw Error("minDigits must be defined and be a number");
  if (!timeWindow || isNaN(timeWindow))
    throw Error("timeWindow must be defined and be a number");

  /**
   * This function has to generate shortcodes of dynamic length to prevent spam
   * - The antispam measure is dinamic length. The db tracks how many active
   *   shortcodes there are. A random shortcode is picked between 0 and 2 * maxSc
   *   resulting in a controlled length but with a greater than 50% of finding a
   *   free shortcode.
   * - In order to remove expired shortcode and track their numbers, they are stored
   *   in "time windows". Every unix timestamp multiple of 1000*1000 ms, is a time window.
   *   Shortcodes are stored in a timewindow that is a least 1000*1000 ms away.
   *   So the duration of a shortcode is between 1000 s and 2000 s.
   * - The shortcode are appended as CSV in the db key `shortcode-list-${timeSlot}`,
   *   so the clean cron process should split the screen by ',' and remove the codes.
   * - `NOTE`: this API does not stringifies or parses JSON, the front-end should do it
   *
   * @param {Object} data
   * @param {Object} options: {
   *   minDigits: 5
   * }
   * @return {Integer} shortcode
   */
  return async function dataToShortcode(data) {
    const timeSlot = Math.floor(Date.now() / timeWindow); // 1550774
    // Compute the keys using a function to prevent naming errors
    const listKey = getKey.list(timeSlot);
    const countKey = getKey.count(timeSlot);
    const minSc = 10 ** minDigits - 1;

    // Generate a dynamic length shortcode
    // In the case a spam attack, the length of the shortcode will grow
    // but don't slow the process of getting shortcode
    const count = (await db.get(countKey)) || 0;
    const maxSc = count < minSc / 2 ? minSc : count * 2;
    const digits = (Math.log(maxSc) * Math.LOG10E + 1) | 0;

    // The await in the condition makes this while non-blocking
    // It takes an average of 1.28739 attempts to get a free shortcode
    let shortcode;
    while (!shortcode || (await db.get(shortcode))) {
      shortcode = String(Math.floor(maxSc * Math.random())).padStart(
        digits,
        "0"
      );
    }

    // Append shortcode to the list of shortcode to delete in that time window
    await db.append(listKey, shortcode);
    await db.increment(countKey);
    await db.set(shortcode, data);

    return shortcode;
  };
}

module.exports = dataToShortcodeFactory;
