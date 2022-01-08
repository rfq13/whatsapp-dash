module.exports = (app) => {
  require("../passport-config")(app);
  const passport = require("passport");
  const jwt = require("jsonwebtoken");
  const { body, validationResult } = require("express-validator");
  const UserModel = require("../models/users");
  var bcrypt = require("bcrypt");

  const authenticated = passport.authenticate(["jwt", "bearer"], {
    session: false,
  });
  // login
  app.post(
    "/login",
    [body("username").notEmpty().isEmail(), body("password").notEmpty()],
    async (req, res, next) => {
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

      passport.authenticate("login", async (err, user, info) => {
        try {
          if (err || !user) {
            return res.send(info);
          }

          req.login(user, { session: false }, async (error) => {
            if (error) return next(error);
            const { _id, username: email, nlp_algo } = user;
            const payload = { user: { _id, email, nlp_algo } };
            const token = jwt.sign(payload, process.env.JWT_SECRET);
            return res.json({ token });
          });
        } catch (error) {
          return res.send(error);
        }
      })(req, res, next);
    }
  );

  // registration
  app.post(
    "/registration",
    [
      body("email").notEmpty().isEmail(),
      body("password").notEmpty(),
      body("firstname").notEmpty(),
    ],
    (req, res) => {
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

      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(req.body.password, salt);
      const data = {
        name: `${req.body.firstname} ${req.body.lastname ?? ""}`,
        username: req.body.email,
        password: hash,
      };

      UserModel.create(data, async ({ errors }, scc) => {
        if (errors) {
          return res.status(500).json(errors);
        } else {
          return res.status(201).json({
            success: {
              _id: scc._doc._id,
              name: scc._doc.name,
              email: scc._doc.username,
            },
          });
        }
      });
    }
  );

  app.get("/user", authenticated, (req, res) => res.send({ user: req.user }));
};
