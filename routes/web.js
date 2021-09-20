const express = require("express");
const router = express.Router();
const whatsappRoute = require("./whatsapp");
const conversationRoute = require("./conversation");
const passport = require("passport");
const axios = require("axios");

router.get("/", async (req, res) => {
  result = "await Session.find({})";
  res.json({ result });
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

router.use("/whatsapp", passport.authenticate(["jwt", "bearer"], { session: false }), whatsappRoute);
router.use("/conversation", passport.authenticate(["jwt", "bearer"], { session: false }), conversationRoute);

module.exports = router;
