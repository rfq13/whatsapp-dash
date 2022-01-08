const express = require("express");
const router = express.Router();
const whatsappRoute = require("./whatsapp");
const conversationRoute = require("./conversation");
const passport = require("passport");
const axios = require("axios");
// const authenticated = passport.authenticate(["jwt", "bearer"], {
//   session: false,
// });
const { translate, randStr, authenticated } = require("../helpers");
const convModel = require("../models/ConversationKey");
const convM = require("../models/Conversations");

const fs = require("fs");
const csv = require("csv-parser");

router.get("/", async (req, res) => {
  result = "await Session.find({})";
  res.json({ result });
});

router.post("/translate", (req, res) => {
  console.log(req.body);
  translate({ text: req.body.text, from: "en" }).then((result) => {
    res.json({ result });
  });
});

router.post("/test-import", authenticated, (req, res) => {
  const results = [];
  console.log("halo", req.user);
  fs.createReadStream("datasets.csv")
    .pipe(csv({}))
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      // console.log("lenght ==>", results.length);
      const translateds = [];

      let insertData = [];
      let insertedIds = [];

      for (let i = 701; i < 900; i++) {
        const data = results[i];

        const translated = await translate({
          text: data.message,
          from: "en",
          to: "id",
        });
        data.message = translated;
        const convType = translated.indexOf("?") == -1 ? 2 : 1;
        const intentKey = `intent${data.conversation_id}`;

        findIndex = insertData.findIndex((v) => v.key == intentKey);
        if (findIndex != -1) {
          existConv = insertData[findIndex];

          indexExConv = existConv.conversations.findIndex(
            (v) => v.type == convType
          );

          if (indexExConv != -1) {
            console.log("henghong", existConv.conversations[indexExConv]);
            existConv.conversations[indexExConv].phrases.push(translated);
          } else {
            existConv.conversations.push({
              phrases: [translated],
              type: convType,
            });
          }
        } else {
          // translateds.push(data);
          insertData.push({
            user_id: req.user._id,
            key: intentKey,
            conversations: [{ phrases: [translated], type: convType }],
          });
        }

        insertedIds.push(data.conversation_id);
      }

      // // Function call
      convModel
        .insertMany(insertData)
        .then(function (success) {
          // res.json({ success });
          console.log("Data inserted"); // Success
          // return;
        })
        .catch(function (error) {
          // res.status(500).json({ error });
          console.log(error); // Failure
        })
        .finally(() => {
          res.json({ insertData, insertedIds });
        });
    });
});

router.post("/test-res", authenticated, (req, res) => {
  convModel.find({}, (err, data) => {
    conversations = {};
    for (let i = 0; i < data.length; i++) {
      const conv = data[i];

      conversations[conv.key] = {
        pertanyaan: conv.conversations.find((v) => v.type == 1).phrases,
        jawaban: conv.conversations.find((v) => v.type == 2).phrases,
      };
    }
    res.json({ conversations });
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

router.use("/v2/whatsapp", authenticated, require("./v2/whatsappRoute"));
router.use("/whatsapp", authenticated, whatsappRoute);
router.use(
  "/conversation",
  passport.authenticate(["jwt", "bearer"], { session: false }),
  conversationRoute
);

module.exports = router;
