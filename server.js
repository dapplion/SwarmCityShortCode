const express = require("express");
const bodyParser = require("body-parser");
const db = require("./utils/db");
// Utils
const wrapErrors = require("./utils/wrapErrors");

/**
 * This API / webserver generates and serves shortcodes for social media sharing
 *
 * Generate short link
 * ===================
 *
 * To generate a short link, the front end has to do a POST request to "/" with json data:
 * {
 *   title: `${hashtagName}: ${itemDescription} for ${swtAmount} SWT`,
 *   description: `Reply to this request for ${swtAmount} SWT, posted on hashtag ${hashtagName}`,
 *   redirectUrl: `https://swarm.city/detail/${hashtagAddress}/${itemHash}`,
 * }
 *
 * The API will reply with json:
 * {
 *   id: 'da49j0uB4umlgHSLf7n9'
 * }
 *
 * Query short link
 * ================
 *
 * Just do a regular GET request to the url ${host}/${id}, i.e. i.swarm.city/da49j0uB4umlgHSLf7n9
 * It will return an HTML with meta tags to be properly displayed in social media
 * The HTML will trigger an immediate redirect to ${redirectUrl} via the http-equiv="refresh" mechanism
 *
 */

const port = process.env.PORT || 3000;
const options = {
  minDigits: 5, // minim number of digits on the shortcode
  timeWindow: 1000 * 1000 // 1000 seconds = ~16.7 min
};

// Dependency injection (it made sense in this case)
const shortcodeToData = require("./utils/shortcodeToData")(db, options);
const dataToShortcode = require("./utils/dataToShortcode")(db, options);
const cleanShortcodes = require("./utils/cleanShortcodes")(db, options);

// Setup app
const app = express();
app.use(bodyParser.text({ limit: "4kb" })); // Incoming req parser, built-in middleware

app.get("/", (_, res) => res.send("Swarm City shortcode service"));

app.get(
  "/:shortcode",
  wrapErrors(async (req, res) => {
    const shortcode = req.params.shortcode;
    const data = await shortcodeToData(shortcode);
    if (!data) res.status(404).send("Shortcode not found");
    else res.json(data);
  })
);

app.post(
  "/",
  wrapErrors(async (req, res) => {
    const data = req.body;
    if (!data || typeof data !== "string")
      throw Error(`You must send text body: 'data-stringified'`);
    const shortcode = await dataToShortcode(data);
    res.send({ shortcode });
  })
);

app.listen(port);
console.log(`App listening at port ${port}`);

// Clean cron job, this function will call itself recursively forever
cleanShortcodes();

module.exports = app; // for testing
