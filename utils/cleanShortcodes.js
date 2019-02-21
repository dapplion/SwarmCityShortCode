const getKey = require("./getKey");

function cleanShortcodesFactory(db, { timeWindow } = {}) {
  if (!db || typeof db !== "object")
    throw Error("db must be defined and an object");
  if (!timeWindow || isNaN(timeWindow))
    throw Error("timeWindow must be defined and be a number");

  // This variable is used to swipe not only the current timeSlotToDelete but all previous timeslots
  let lastCleanedTimeSlot = Math.round(1550000000000 / timeWindow); // time of development
  /**
   * The task is executed everytime the unix timestamp is a multiple of timeWindow
   *
   *  | short codes to delete (all stored in the lower time slot, 100)
   *  |                | current time (x)
   *  |                || time at which the shortcodes should be deleted
   *  ||||||||||       x|        |
   *  |        |        |        |
   * 100      101      102      103 (time slots)
   */
  async function cleanShortcodes() {
    console.log("Cleaning shortcodes at ", Date.now());
    const currentTimeSlot = Math.round(Date.now() / timeWindow); // 1550774

    // Delete function
    // Keep crawling back until you found a timeslot without shortcodes
    let timeSlotToDelete = currentTimeSlot - 2;
    for (let i = lastCleanedTimeSlot; i <= timeSlotToDelete; i++) {
      // This for loop is used to swipe not only the current timeSlotToDelete but all previous timeslots
      await db.deleteList(getKey.list(i));
    }
    lastCleanedTimeSlot = timeSlotToDelete;

    const nextTimeSlot = currentTimeSlot + 1;
    setTimeout(cleanShortcodes, nextTimeSlot * timeWindow - Date.now());
  }
  return cleanShortcodes;
}

module.exports = cleanShortcodesFactory;
