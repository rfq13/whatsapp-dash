const translatte = require("translatte");
const { GoogleTranslator } = require("@translate-tools/core/translators/GoogleTranslator");

module.exports = function ({ from = "en", to = "id", text }) {
  return new Promise((resolve, reject) => {
    translatte(text, { from, to })
      .then((res) => resolve(res.text))
      .catch((err) => {
        const translator = new GoogleTranslator();

        // Translate single string
        translator
          .translate(text, from, to)
          .then((translate) => resolve(translate))
          .catch((err) => {
            console.log("howdy");
            reject(err);
          });
      });
  });
};
