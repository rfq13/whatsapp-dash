const mapper = (data,withID=false) =>{
    const fixPhrases = {};
    for (const phrase in data) {
        if (Object.hasOwnProperty.call(data, phrase)) {
            const sentenceData = data[phrase];
            let sentences = sentenceData.phrases;

            if (withID) {
                sentences = {sentences,id:sentenceData._id}
            }

            let keyType = sentenceData.type == 1 ? {pertanyaan:sentences} : {jawaban:sentences};

            const rowData = fixPhrases[sentenceData.key];

            fixPhrases[sentenceData.key] = Object.assign(keyType, rowData);
        }
    }
    return fixPhrases;
};

module.exports = mapper;