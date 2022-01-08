class RabinKarp {
  constructor(mySentence, stringToSearch) {
    this.mySentence = mySentence;
    this.stringToSearch = stringToSearch;
  }
}
const calculateHash = function (myText, largePrime, randomNumber) {
  let hash = 0;
  for (let i = 0; i <= myText.length - 1; i++) {
    hash = (hash * randomNumber + myText.charCodeAt(i)) % largePrime;
  }
  return hash;
};
const areStringEqual = function (firstString, secondString) {
  if (firstString !== secondString) {
    return false;
  }
  for (let i = 0; i < firstString.length; i++) {
    if (firstString[i] !== secondString[i]) {
      return false;
    }
  }
  return true;
};
RabinKarp.prototype.searchText = function (sentence, stringToSearch) {
  let largePrime = 337;
  let randomNumber = 50;
  let stringPositions = [];
  let stringToSearchHash = calculateHash(
    stringToSearch,
    largePrime,
    randomNumber
  );
  let text;
  let sentenceHash;
  // Loop through our sentence
  for (let i = 0; i <= sentence.length - stringToSearch.length; i++) {
    text = sentence.slice(i, i + stringToSearch.length);
    sentenceHash = calculateHash(text, largePrime, randomNumber);
    if (areStringEqual(text, stringToSearch)) {
      stringPositions.push({ position: i });
    }
    // If the hash is not same, then continue to next step
    if (stringToSearchHash !== sentenceHash) continue;
  }
  return stringPositions;
};

RabinKarp.prototype.exec = function (sentence, phrase) {
  // const performRabinKarpAlgorithm = (sentence, textToSearch) => {
  //   return this.searchText(sentence, textToSearch);
  // };

  arrPhrases = phrase.split(" ");
  let value = 0;
  for (let i = 0; i < arrPhrases.length; i++) {
    const txt = arrPhrases[i];
    res = this.searchText(sentence, txt);
    value += parseInt(res.length);
  }

  // const matchingText = performRabinKarpAlgorithm(
  //   "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
  //   "typesetting"
  // );

  return { text: sentence, value };
};

const fuzzy_match = function (text, search) {
  // search = tokenize(search.replace(/\ /g, " ").toLowerCase());
  // console.log(search);
  var tokens = [];
  var search_position = 0;
  const charValue = [];
  let lastFound = 0;
  let minSimiliarity = (parseInt(search.length) * 30) / 100;

  // text = ganti(text,{simply_minghwa:'contoh sederhana'});

  for (var n = 0; n < text.length; n++) {
    var text_char = text[n];
    const jarak = n - lastFound;
    if (
      search_position < search.length &&
      text_char.toLowerCase() == search[search_position].toLowerCase() &&
      jarak < 5
    ) {
      // text_char = '<b>' + text_char + '</b>';
      charValue.push(text_char);
      // if (charValue.includes(n - 1)) charValue.push(`${n - 1}*1`);

      search_position += 1;
      lastFound = n;
    }
    tokens.push(text_char);
  }

  // console.log(search_position,text.length,search.length);
  let total = charValue.length;

  if (search_position > search.length || total < minSimiliarity || total < 4)
    return { text: "", value: 0 };

  joinText = tokens.join("").replace(/<[^>]*>?/gm, "");

  // let value = (total / joinText.length) * 100; //.toFixed(2);

  return {
    text: joinText,
    value: total,
    // value,
    // total,
    // jt: joinText.length,
  };
};

module.exports = {
  RabinKarp,
  fuzzy_match,
};
