// index.js
// where your node app starts

// init project
require("dotenv").config();
var express = require("express");
var app = express();

const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url");

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(bodyParser.urlencoded({ extended: false }));

let urlDatabase = [];
let idCounter = 1;

// your first API endpoint...
app.get("/api/whoami", function (req, res) {
  let ipaddress = req.ip;
  let language = req.headers["accept-language"];
  let software = req.headers["user-agent"];

  const result = {
    ipaddress,
    language,
    software,
  };
  res.json(result);
});

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;
  const parsedUrl = urlParser.parse(originalUrl);

  if (!parsedUrl.protocol || !parsedUrl.hostname) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const shortUrl = idCounter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find((entry) => entry.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
