const fs = require('fs');
const { Stemmer,Tokenizer } = require('sastrawijs');

const alternative = [
    "Same",
    "Go on...",
    "Bro...",
    "Try again",
    "I don't understand :/"
]

const coronavirus = ["Please stay home", "Wear a mask", "Fortunately, I don't have COVID", "These are uncertain times"]


function ganti(params,data) {
    return params.replace(
        /%(\w*)%/g, // or /{(\w*)}/g for "{this} instead of %this%"
        function( m, key ){
            return data.hasOwnProperty( key ) ? data[ key ] : "";
        }
    )
}

function tokenisasi(sentence) {
  var stemmed = [];
//   const custom = ['ga','ga'];
  var stemmer = new Stemmer();
  var tokenizer = new Tokenizer();
  words = tokenizer.tokenize(sentence);
  for (word of words) {
    stemmed.push(stemmer.stem(word));
  }
  return stemmed.join(' ');
}


function fuzzy_match(text, search)
{
    search = tokenisasi(search.replace(/\ /g, ' ').toLowerCase());
    // console.log(search);
    var tokens = [];
    var search_position = 0;
    charValue = [];

    // text = ganti(text,{simply_minghwa:'contoh sederhana'});

    textGab = '';


    if (check = text.indexOf(search)) {
        textGab = text.substring(0,check);
        text = text.substring(check);
    }
    
    for (var n=0; n<text.length; n++)
    {
        var text_char = text[n];
        if(search_position < search.length &&
        text_char.toLowerCase() == search[search_position])
        {
            // text_char = '<b>' + text_char + '</b>';
            charValue.push(text_char);
            if (charValue.includes(n-1)) charValue.push(`${n-1}*1`)

            search_position += 1;
        }
        tokens.push(text_char);
    }

    // console.log(search_position,text.length,search.length);

    if (search_position > search.length) return {text:'',value:0};

    // return tokens.join('');
    joinText = textGab+tokens.join('').replace(/<[^>]*>?/gm, '');

    let total = charValue.length;
    
    // if (textGab.length > 0) {
    //     total += textGab.length
    // }

    let value = (total/joinText.length)*(100).toFixed(2);

    // console.log(charValue);
    return {
        text:joinText,
        value:total,
        total,
        jt:joinText.length
    };
}


var learn = (data) =>{
    const input = data.text;
    const CONVERSATION_FILE = `./phrases-data/user-${data.user}.json`;
    let conversations = false;

    fs.access(CONVERSATION_FILE, (err) => {
        if (err) {
            let newFile = fs.readFileSync("./conversations.json");
            fs.writeFileSync(CONVERSATION_FILE,newFile);
        }
    });
    
    conversations = JSON.parse(fs.readFileSync(CONVERSATION_FILE))
    result = false;
    let results = [];

    if (conversations) {
        //kumpulkan semua pertanyaan
        const pertanyaans = [].concat.apply(
            [],
            //kumpulkan semua pertanyaan ke dalam satu array
            Object.keys(conversations).map((key, index)=> conversations[key].pertanyaan)
        );
    
        /* 
            proses semua pertanyaan menggunakan fuzzy_match method.
            hasil dari proses fuzzy matching setiap index akan mendapatkan value yang menjadi ukuran akurasi setiap index
        */
    //    console.log(pertanyaans);
        pertanyaans.forEach((el,i) => {
            hasil = fuzzy_match(el,input);
            results.push(hasil)
        });
    
        //cari value tertinggi
        const maxValue = Math.max.apply(Math, results.map(function(v) { return v.value; }));

        console.log({maxValue,results});

        if (maxValue > 0) {
    
            let selecteD = results.filter((result) => result.value == maxValue); //ambil index pertanyaan dengan value tertinggi
            
            if (selecteD.length > 0) {
                category = Object.keys(conversations).filter((q,i) => conversations[q].pertanyaan.includes(selecteD[0].text)) //ambil satu pertanyaan terpilih, kemudian cari kategori dari conversations yang mana pertanyaannya mencakup hasil pertanyaan terpilih
    
                replies = conversations[category[0]].jawaban; //setelah kategori ditemukan, ambil semua jawabannya
                result = replies[Math.floor(Math.random() * replies.length)];//pilih jawaban secara random
            }
        }
        
    }


    return result;
}

function output(input) {
    let answer;

    // Regex remove non word/space chars
    // Trim trailing whitespce
    // Remove digits - not sure if this is best
    // But solves problem of entering something like 'hi1'

    let text = input.text.toLowerCase().replace(/[^\w\s]/gi, "")
        .replace(/[\d]/gi, "")
        .trim()
        .replace(/ a /g, " ")   // 'tell me a story' -> 'tell me story'
        .replace(/i feel /g, "")
        .replace(/whats/g, "what is")
        .replace(/please /g, "")
        .replace(/ please/g, "")
        .replace(/r u/g, "are you");

    if (learn({text,user:input.user})) {
        // Search for exact match in `prompts`
        answer = learn({text,user:input.user});
    } else if (text.match(/thank/gi) || text.match(/thx/gi)) {
        answer = "You're welcome!"
    } else if (text.match(/(corona|covid|virus)/gi)) {
        // If no match, check if message contains `coronavirus`
        answer = coronavirus[Math.floor(Math.random() * coronavirus.length)];
    } else {
        // If all else fails: random alternative
        answer = alternative[Math.floor(Math.random() * alternative.length)];
    }

    return answer;
}

module.exports = {output};