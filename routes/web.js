const express = require("express");
const router = express.Router();
const whatsappRoute = require("./whatsapp");
const conversationRoute = require("./conversation");
const passport = require("passport");
const axios = require("axios");
const authenticated = passport.authenticate(["jwt", "bearer"], { session: false });
const translatte = require("translatte");
const fs = require("fs");
const csv = require("csv-parser");
const pso = require("../helpers/PSO");
const { GoogleTranslator } = require("@translate-tools/core/translators/GoogleTranslator");

router.get("/", async (req, res) => {
  result = "await Session.find({})";
  res.json({ result });
});

router.get("/pso", async (req, res) => {
  var toleratedError = 0.01; // samller or equal computation error stops algorithm
  var epochesLimit = 100; // maximal number of executed iterations
  var particlesCount = 10;

  console.log("[epoch]\t[error]\t\t\t[position]\n");

  var solution = pso.exampleUsage.computeEpoches$2(toleratedError, epochesLimit, particlesCount);

  console.log("-------------------------------");
  console.log("Solution:");
  console.log("  error: " + solution.error);
  console.log("  position: " + solution.position);

  result = "await Session.find({})";
  res.json({ result });
});

router.get("/neo-translate", async (req, res) => {
  result = "await Session.find({})";

  const translator = new GoogleTranslator();

  // Translate single string
  const translate = await translator.translate("Hello world", "en", "id");

  res.json({ result, translate });
});

router.get("/translate", async (req, res) => {
  result = "await Session.find({})";
  res.json({ result });

  translatte("apakah anda laki-laki?", { from: "id", to: "en" })
    .then((res) => {
      console.log(res.text);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get("/test-import", (req, res) => {
  const results = [];
  fs.createReadStream("datasets.csv")
    .pipe(csv({}))
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      console.log("nyoook ==>", results.length);
      const translateds = [];
      // for (let i = 0; i < results.length; i++) {
      for (let i = 0; i < 4; i++) {
        const data = results[i];
        const translated = await translatte(data.message, { from: "en", to: "id" });
        console.log(translated);
        translateds.push(translated.text);
      }

      res.json({ translateds });
    });
});

router.get("/products", async (req, res) => {
  await axios
    .get("https://ponnybeaute.co.id/api/v1/product")
    .then((response) => {
      products = response.data;
      res.json(products);
    })
    .catch(function (error) {
      res.json({ error });
    });
});

router.use("/whatsapp", authenticated, whatsappRoute);
router.use("/conversation", passport.authenticate(["jwt", "bearer"], { session: false }), conversationRoute);

module.exports = router;
