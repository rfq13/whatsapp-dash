const express = require("express");
const router = express.Router();
const convModel = require("../../models/ConversationKey");
const UserModel = require("../../models/users");
const { body, validationResult } = require("express-validator");
const routePath = "/conversations";
const getConvData = (page, limit, query) =>
  new Promise((resolve, reject) => {
    convModel.paginate(
      query,
      {
        page,
        limit,
        select: ["key", "conversations"],
      },
      (err, result) => {
        resolve(result);
      }
    );
  });
router
  .route(routePath)
  .post([body("intent").notEmpty()], (req, res) => {
    const error = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });
    if (!error.isEmpty()) {
      res.status(422).json({
        message: "tidak dapat melanjutkan proses",
        response: error.mapped(),
      });
      return;
    }

    const { body } = req;
    convModel.create(
      {
        key: body.intent,
        user_id: req.user._id,
        conversations: [
          { phrases: [], type: 1 },
          { phrases: [], type: 2 },
        ],
      },
      function (err, conv) {
        if (err) return res.status(500).send(err);

        page = body.page ?? 1;
        limit = body.perPage ?? 10;
        getConvData(page, limit, { user_id: req.user._id }).then(
          ({ docs: conversations, page, totalDocs: rows }) => {
            res.json({ conversations, page, rows });
          }
        );
      }
    );
  })
  .get((req, res) => {
    const { query } = req;
    page = query.page ?? 1;
    limit = query.perPage ?? 10;
    getConvData(page, limit, { user_id: req.user._id }).then(
      ({ docs: conversations, page, totalDocs: rows }) => {
        res.json({ conversations, page, rows });
      }
    );
  })
  .delete(body("intentId").notEmpty(), (req, res) => {
    const error = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });
    if (!error.isEmpty()) {
      res.status(422).json({
        message: "tidak dapat melanjutkan proses",
        response: error.mapped(),
      });
      return;
    }

    const { body } = req;
    convModel.deleteOne({ _id: body.intentId }, (err) => {
      if (err) return res.status(500).send(err);

      const { body } = req;
      page = body.page ?? 1;
      limit = body.perPage ?? 10;
      getConvData(page, limit, { user_id: req.user._id }).then(
        ({ docs: conversations, page, totalDocs: rows }) => {
          res.json({ conversations, page, rows });
        }
      );
    });
  })
  .put([body("intentId").notEmpty(), body("change").notEmpty()], (req, res) => {
    const error = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });
    if (!error.isEmpty()) {
      res.status(422).json({
        message: "tidak dapat melanjutkan proses",
        response: error.mapped(),
      });
      return;
    }

    const { body } = req;

    convModel.updateOne({ _id: body.intentId }, { key: body.change }, (err) => {
      if (err) return res.status(500).send(err);

      const { body } = req;
      page = body.page ?? 1;
      limit = body.perPage ?? 10;
      getConvData(page, limit, { user_id: req.user._id }).then(
        ({ docs: conversations, page, totalDocs: rows }) => {
          res.json({ conversations, page, rows });
        }
      );
    });
  });
// =========
router
  .route(routePath + "/:id")
  .post([body("type").notEmpty().isNumeric()], async (req, res) => {
    const error = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });
    if (!error.isEmpty()) {
      res.status(422).json({
        message: "tidak dapat melanjutkan proses",
        response: error.mapped(),
      });
      return;
    }

    const { body } = req;

    if (![1, 2].includes(body.type)) {
      res.status(422).json({
        message: "tidak dapat melanjutkan proses",
        response: { type: "type 1 untuk pertanyaan, type 2 untuk jawaban!" },
      });
      return;
    }

    convModel.findOne({ _id: req.params.id }, (err, conv) => {
      checksubConv = conv.conversations.find((v) => v.type == body.type);
      // console.log(checksubConv);
      checksubConv.phrases.push(" ");
      // if (checksubConv == undefined) {
      // }

      conv.save(function (err) {
        if (err) return res.status(500).send(err);

        const { body } = req;
        page = body.page ?? 1;
        limit = body.perPage ?? 10;
        getConvData(page, limit, { user_id: req.user._id }).then(
          ({ docs: conversations, page, totalDocs: rows }) => {
            res.json({ conversations, page, rows });
          }
        );
      });
    });
  })
  .put(
    [
      body("change_index").notEmpty(),
      body("change_value").notEmpty(),
      body("subconv").notEmpty(),
    ],
    async (req, res) => {
      const error = validationResult(req).formatWith(({ msg }) => {
        return msg;
      });
      if (!error.isEmpty()) {
        res.status(422).json({
          message: "tidak dapat melanjutkan proses",
          response: error.mapped(),
        });
        return;
      }

      convModel.findOne({ _id: req.params.id }, (err, conv) => {
        const { body } = req;
        const { phrases } = conv.conversations.id(body.subconv);
        if (body.create) {
          phrases.push(body.change_value);
        } else {
          phrases[body.change_index] = body.change_value;
        }

        conv.save(function (err) {
          if (err) return res.status(500).send(err);

          const { body } = req;
          page = body.page ?? 1;
          limit = body.perPage ?? 10;
          getConvData(page, limit, { user_id: req.user._id }).then(
            ({ docs: conversations, page, totalDocs: rows }) => {
              res.json({ conversations, page, rows });
            }
          );
        });
      });
    }
  )
  .delete(body("conv_id").notEmpty(), body("index").notEmpty(), (req, res) => {
    const error = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });
    if (!error.isEmpty()) {
      res.status(422).json({
        message: "tidak dapat melanjutkan proses",
        response: error.mapped(),
      });
      return;
    }

    convModel.findOne({ _id: req.params.id }, (err, conv) => {
      const { body } = req;

      conv.conversations.id(body.conv_id).phrases.splice(body.index, 1);

      conv.save(function (err) {
        if (err) return res.status(500).send(err);

        // const { body } = req;
        page = body.page ?? 1;
        limit = body.perPage ?? 10;
        getConvData(page, limit, { user_id: req.user._id }).then(
          ({ docs: conversations, page, totalDocs: rows }) => {
            res.json({ conversations, page, rows });
          }
        );
      });
    });
  });

router.get("/testreformat", (req, res) => {
  convModel
    .find({ user_id: req.user._id })
    .limit(2)
    .exec((err, result) => {
      formatted = {};
      for (let i = 0; i < result.length; i++) {
        const conv = result[i];
        formatted[conv.key] = {
          pertanyaan: conv.conversations.find((v) => v.type == 1).phrases,
          jawaban: conv.conversations.find((v) => v.type == 2).phrases,
        };
      }
      res.json({ formatted });
    });
});

router
  .route("/algo")
  .post((req, res) => {
    const { body, user } = req;
    if (![1, 2].includes(body.set)) {
      res.status(422).json({
        message: "tidak dapat melanjutkan proses",
      });
    } else {
      UserModel.updateOne(
        { _id: user._id },
        { nlp_algo: body.set },
        (err, docs) => {
          if (!err) {
            UserModel.findOne({ _id: user._id }, (err, docs) => {
              res.json(docs);
            });
          }
        }
      );
    }
  })
  .get((req, res) => {
    UserModel.findOne({ _id: req.user._id }, (err, user) => {
      res.json(user);
    });
  });

module.exports = router;
