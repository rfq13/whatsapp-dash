const fs = require("fs");
const { Stemmer, Tokenizer } = require("sastrawijs");
const convModel = require("../models/ConversationKey");
const { fuzzy_match, RabinKarp } = require("../helpers/algo");
const UserModel = require("../models/users");

const alternative = [
  "maaf, pesan anda kurang dapat mengerti, bisa diperjelas?",
  "maaf, bisa diperjelas pertanyaannya kak?",
  // "I don't understand :/",
];

const coronavirus = [
  "Please stay home",
  "Wear a mask",
  "Fortunately, I don't have COVID",
  "These are uncertain times",
];

function ganti(params, data) {
  return params.replace(
    /%(\w*)%/g, // or /{(\w*)}/g for "{this} instead of %this%"
    function (m, key) {
      return data.hasOwnProperty(key) ? data[key] : "";
    }
  );
}

function tokenize(sentence) {
  var stemmed = [];
  //   const custom = ['ga','ga'];
  var stemmer = new Stemmer();
  var tokenizer = new Tokenizer();
  words = tokenizer.tokenize(sentence);
  for (word of words) {
    stemmed.push(stemmer.stem(word));
  }
  return stemmed.join(" ");
}

var learn = (data) => {
  return new Promise((resolve, reject) => {
    const input = data.text;
    convModel.find({ user_id: data.user }, async (err, result) => {
      let conversations = false;
      if (err) {
        const CONVERSATION_FILE = `./phrases-data/user-${data.user}.json`;
        fs.access(CONVERSATION_FILE, (err) => {
          if (err) {
            let newFile = fs.readFileSync("./conversations.json");
            fs.writeFileSync(CONVERSATION_FILE, newFile);
          }
        });

        conversations = JSON.parse(fs.readFileSync(CONVERSATION_FILE));
      } else {
        formatted = {};
        for (let i = 0; i < result.length; i++) {
          const conv = result[i];
          formatted[conv.key] = {
            pertanyaan: conv.conversations.find((v) => v.type == 1).phrases,
            jawaban: conv.conversations.find((v) => v.type == 2).phrases,
          };
        }
        conversations = formatted;
      }

      result = false;
      let results = [];

      if (conversations) {
        //kumpulkan semua pertanyaan
        const pertanyaans = [].concat.apply(
          [],
          //kumpulkan semua pertanyaan ke dalam satu array
          Object.keys(conversations).map(
            (key, index) => conversations[key].pertanyaan
          )
        );

        /* 
              proses semua pertanyaan menggunakan fuzzy_match method.
              hasil dari proses fuzzy matching setiap index akan mendapatkan value yang menjadi ukuran akurasi setiap index
          */
        //    console.log(pertanyaans);
        const { nlp_algo } = await UserModel.findOne({ _id: data.user });

        pertanyaans.forEach((el, i) => {
          if (nlp_algo == 1) {
            hasil = fuzzy_match(el, input);
          } else {
            hasil = new RabinKarp().exec(el, input);
          }
          results.push(hasil);
        });

        // console.log();
        //cari value tertinggi
        const maxValue = Math.max.apply(
          Math,
          results.map(function (v) {
            return v.value;
          })
        );

        // console.log({ maxValue });

        if (maxValue > 0) {
          let selecteD = results.find((result) => result.value == maxValue); //ambil index pertanyaan dengan value tertinggi
          console.log({ selecteD });
          if (selecteD != -1) {
            category = Object.keys(conversations).filter((q, i) =>
              conversations[q].pertanyaan.includes(selecteD.text)
            ); //ambil satu pertanyaan terpilih, kemudian cari kategori dari conversations yang mana pertanyaannya mencakup hasil pertanyaan terpilih

            replies = conversations[category[0]].jawaban; //setelah kategori ditemukan, ambil semua jawabannya
            result = replies[Math.floor(Math.random() * replies.length)]; //pilih jawaban secara random
          }
        }
      }

      resolve(result);
    });
  });
};

async function output(input) {
  let answer;

  // Regex remove non word/space chars
  // Trim trailing whitespce
  // Remove digits - not sure if this is best
  // But solves problem of entering something like 'hi1'

  let text = input.text
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/[\d]/gi, "")
    .trim()
    .replace(/ a /g, " ") // 'tell me a story' -> 'tell me story'
    .replace(/i feel /g, "")
    .replace(/whats/g, "what is")
    .replace(/please /g, "")
    .replace(/ please/g, "")
    .replace(/r u/g, "are you");

  if ((searchAns = await learn({ text, user: input.user }))) {
    // Search for exact match in `prompts`
    answer = searchAns;
  } else if (text.match(/thank/gi) || text.match(/thx/gi)) {
    answer = "You're welcome!";
  } else if (text.match(/(corona|covid|virus)/gi)) {
    // If no match, check if message contains `coronavirus`
    answer = coronavirus[Math.floor(Math.random() * coronavirus.length)];
  } else {
    // If all else fails: random alternative
    answer = alternative[Math.floor(Math.random() * alternative.length)];
  }

  return answer;
}

module.exports = { output };
