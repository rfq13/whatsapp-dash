const express = require("express");
const router = express.Router();
const paginatedResults = require("../helpers/paginate");
const users = require("../models/users");
const whatsappController = require("../controllers/whatsapp");
const { body } = require("express-validator");
const fs = require("fs");
let CONVERSATION_FILE = "./conversations.json";
const Session = require("../models/Sessions");
const convModel = require("../models/ConversationKey");
async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

router.get("/connection", whatsappController.connect);

router
  .route("/send")
  .post(
    [body("number").notEmpty(), body("message").notEmpty()],
    whatsappController.sendMessage
  );

router
  .route("/user")
  .get(paginatedResults(users), (req, res) => {
    res.json(res.paginatedResults);
  })
  .post(
    [
      body("name").notEmpty(),
      body("email").notEmpty().isEmail(),
      body("password").notEmpty(),
    ],
    whatsappController.addUser
  );

router.route("/user/:id").get((req, res) => {
  const query = users.findById(req.params.id);
  try {
    query.findOne((err, user) => {
      if (err) return res.sendStatus(404);
      res.json(user);
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

const getUserByEmail = (email) => {
  const query = users.find({ email: email });
};

router.route("/user/email/:email").get(async (req, res) => {
  user = await getUserByEmail(req.params.email);
  // console.log(user,'user');
  res.send(user);
});

router.get("/sessions", async (req, res) => {
  result = await Session.find({ user_id: req.user._id });
  res.json({ results: result });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get("/fuzzy", (req, res) => {
  const regex = new RegExp(escapeRegex(req.query.search), "gi");
  res.send(regex);
});

router.route("/conversations").post(async (req, res) => {
  let convPath = `./phrases-data/user-${req.user._id}.json`;
  // let convPath = CONVERSATION_FILE;

  // console.log(fs.existsSync(convPath));
  if (fs.existsSync(convPath)) {
    conversations = JSON.parse(fs.readFileSync(convPath));
  } else {
    var conversations = JSON.parse(fs.readFileSync(CONVERSATION_FILE));
    fs.writeFileSync(convPath, JSON.stringify(conversations));
  }

  const { id, val, act } = req.body;

  if (id && id.split("|").length >= 2) {
    //conversation managing

    const params = id.split("|");
    const type = params[1] == "p" ? "pertanyaan" : "jawaban";
    let selectedConv = conversations[params[0]];

    const convIndex =
      selectedConv[type].length > 0
        ? selectedConv[type].findIndex((conv) => conv == params[2])
        : -1;

    if (act == "update") {
      if (convIndex != -1) {
        selectedConv[type][convIndex] = val;
      }
    } else if (act == "create") {
      const addIndex = selectedConv[type].length;
      selectedConv[type][addIndex] = "";
    } else if (act == "delete") {
      if (convIndex != -1) selectedConv[type].splice(convIndex, 1);
    }
  } else if (id) {
    //category conversation update or delete
    if (val || act == "update") {
      const newKey = val.replace(" ", "_");
      conversations[newKey] = conversations[id];
    }

    delete conversations[id];
  } else if (val) {
    //category conversation create
    conversations[val] = { pertanyaan: [], jawaban: [] };
  }

  fs.writeFileSync(convPath.replace("./", ""), JSON.stringify(conversations));
  conversations = JSON.parse(fs.readFileSync(convPath));

  res.json({ conversations });
});

module.exports = router;
