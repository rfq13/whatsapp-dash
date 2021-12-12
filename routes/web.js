const express = require("express");
const router = express.Router();
const whatsappRoute = require("./whatsapp");
const conversationRoute = require("./conversation");
const passport = require("passport");
const axios = require("axios");
const authenticated = passport.authenticate(["jwt", "bearer"], { session: false });
const translate = require("../helpers/translate");

const fs = require("fs");
const csv = require("csv-parser");

router.get("/", async (req, res) => {
  result = "await Session.find({})";
  res.json({ result });
});

router.get("/translate", (req, res) => {
  translate({ text: req.body.text, from: "en" }).then((result) => {
    res.json({ result });
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
      console.log("lenght ==>", results.length);
      const translateds = [];
      // for (let i = 0; i < results.length; i++) {
      for (let i = 0; i < 20; i++) {
        const data = results[i];
        const translated = await translate({ text: data.message, from: "en", to: "id" });
        console.log(data);
        translateds.push(translated);
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
