const express = require("express");
const router = express.Router();
const Model = require("../models/Conversations");
const ConversationKey = require("../models/ConversationKey");
const pagination = require("../helpers/paginate");
const convMapper = require("../helpers/conversationDataMapper");

const generateConversation = (conversationsData, { callback = () => {} }) => {
  ConversationKey.collection
    .insert(conversationsData)
    .then(() => {
      if (typeof callback == "function") {
        callback();
      }
    })
    .catch((error) => {
      console.log("error cooook", error);
    });
};

router
  .route("/")
  .get(
    [
      // (req,res,next)=> {
      //     req.params = {user_id:req.user._id};
      //     next();
      // },
      // pagination(Model)
    ],
    async (req, res) => {
      // const data = res.paginatedResults.results;
      // res.paginatedResults['results'] = convMapper(data);
      // res.json(res.paginatedResults);

      const data = await Model.find({ user_id: req.user._id });
      res.json(convMapper(data, true));
    }
  )
  .post(async (req, res) => {
    const findedConv = await ConversationKey.find({ user_id: req.user._id });
    console.log(findedConv.length);
    if (findedConv.length) {
      console.log("ngondet");
      res.send({ gagal: "nyrot" });
      return;
    }

    const conversations = {
      sapaan: {
        pertanyaan: ["hi", "hey", "hello", "good morning", "good afternoon"],
        jawaban: ["Hello!", "Hi!", "Hey!", "Hi there!", "Howdy"],
      },
      opening: {
        pertanyaan: ["how are you", "how is life", "how are things"],
        jawaban: ["Fine... how are you?", "Pretty well, how are you?", "Fantastic, how are you?"],
      },
      kabar: {
        pertanyaan: ["what are you doing", "what is going on", "what is up"],
        jawaban: ["Nothing much", "About to go to sleep", "Can you guess?", "I don't know actually"],
      },
      umur: {
        pertanyaan: ["how old are you"],
        jawaban: ["I am infinite"],
      },
      me: {
        pertanyaan: ["who are you", "are you human", "are you bot", "are you human or bot"],
        jawaban: ["I am just a bot", "I am a bot. What are you?"],
      },
      creator: {
        pertanyaan: ["who created you", "who made you"],
        jawaban: ["someone", "JavaScript"],
      },
      about: {
        pertanyaan: ["your name please", "your name", "may i know your name", "what is your name", "what call yourself"],
        jawaban: ["I am nameless", "I don't have a name"],
      },
    };

    const convKeyData = [];

    for (const key in conversations) {
      if (Object.hasOwnProperty.call(conversations, key)) {
        const newConvData = [];
        const dataConv = conversations[key];
        for (const index in dataConv) {
          if (Object.hasOwnProperty.call(dataConv, index)) {
            const phrases = dataConv[index]; //pertanyaan atau jawaban
            newConvData.push({
              type: index == "pertanyaan" ? 1 : 2,
              phrases,
            });
          }
        }

        const newData = {
          key,
          user_id: req.user._id,
          conversations: newConvData,
        };
        convKeyData.push(newData);
      }
    }

    console.log("nyah", convKeyData);
    const generateProcess = new Promise((resolve, reject) => generateConversation(convKeyData, { callback: resolve() }));
    console.log("nyrot");
    generateProcess.then(() => {
      console.log("nyret");
      res.json({ message: "success" });
    });
  })
  .patch(async (req, res) => {
    Model.findById(req.phrase_id, (err, doc) => {
      doc.phrases = req.phrases;
      doc.save(async () => {
        const data = await Model.find({ user_id: req.user._id });
        res.json(convMapper(data));
      });
    });
  })
  // delete => hanya digunakan untuk menghapus 1 kategori
  .delete((req, res) => {
    Model.deleteMany(
      {
        _id: {
          $in: req.ids,
        },
      },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      }
    );
  });

module.exports = router;
