const express = require("express");
const router = express.Router();
const whatsappRoute = require("./whatsapp");
const conversationRoute = require("./conversation");
const passport = require('passport');
const axios = require('axios');
const fs = require('fs');
const sastrawi = require('sastrawijs');

router.get("/", async (req, res) => {
  result = "await Session.find({})";
  res.json({ result: result });
});
router.post("/", (req, res) => {
  console.log(req.body.name);
  res.json(req.body);
});

router.get("/products",async (req,res)=>{
  await axios.get('https://ponnybeaute.co.id/api/v1/product')
  .then( response =>{
    products = response.data;
    res.json(products);
  }).catch(function (error) {
    res.json({error});
  });
})

router.get("/crateJsonFile",async (req,res)=>{
  
  const conversations = {
    sapaan:{
        pertanyaan:["hi", "hey", "hello", "good morning", "good afternoon"],
        jawaban:["Hello!", "Hi!", "Hey!", "Hi there!","Howdy"]
    },
    opening:{
        pertanyaan:["how are you", "how is life", "how are things"],
        jawaban:[
            "Fine... how are you?",
            "Pretty well, how are you?",
            "Fantastic, how are you?"
        ],
    },
    kabar:{
        pertanyaan:["what are you doing", "what is going on", "what is up"],
        jawaban:[
                    "Nothing much",
                    "About to go to sleep",
                    "Can you guess?",
                    "I don't know actually"
                ],
    },
    umur:{
        pertanyaan:["how old are you"],
        jawaban:["I am infinite"],
    },
    me:{
        pertanyaan:["who are you", "are you human", "are you bot", "are you human or bot"],
        jawaban:["I am just a bot", "I am a bot. What are you?"],
    },
    creator:{
        pertanyaan:["who created you", "who made you"],
        jawaban:["ripeki","JavaScript"],
    },
    about:{
        pertanyaan:[
            "your name please",
            "your name",
            "may i know your name",
            "what is your name",
            "what call yourself"
        ],
        jawaban:["I am nameless", "I don't have a name"],
    },
  }

  let data = JSON.stringify(conversations);
  fs.writeFileSync('conversations.json', data);
  res.json({text:"ownghe"});
});



router.get('/sastrawi',(req,res)=>{
  var sentence =
  "Perekonomian Indonesia sedang dalam pertumbuhan yang membanggakan";
  var stemmed = [];
  var stemmer = new sastrawi.Stemmer();
  var tokenizer = new sastrawi.Tokenizer();
  words = tokenizer.tokenize(sentence);
  for (word of words) {
    stemmed.push(stemmer.stem(word));
  }
  res.json({stemmed});
})

// router.use("/whatsapp", passport.authenticate('jwt', { session: false }), whatsapp);
router.use("/whatsapp",passport.authenticate(['jwt','bearer'], { session: false }),whatsappRoute);
router.use("/conversation",passport.authenticate(['jwt','bearer'], { session: false }),conversationRoute);

module.exports = router;
