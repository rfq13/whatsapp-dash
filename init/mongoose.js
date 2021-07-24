const mongoose = require('mongoose');
// Use connect method to connect to the server
mongoose.connect(process.env.DB_HOST, {useNewUrlParser:true, useUnifiedTopology:true},(err, client) => {
    console.log("db Connected");
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', ()=>{});