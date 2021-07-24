const UserModels = require('../models/users')
const {validationResult} = require('express-validator');
const { MessageMedia } = require('whatsapp-web.js');
const { phoneFormatter,checkRegisteredNumber } = require('../helpers/phoneformatter');
const axios = require('axios');
const bcrypt = require('bcrypt');

exports.connect = (req,res)=>{
    res.sendFile("index.html",{root:"./"});
}
exports.sendMessage = async (req,res)=>{
    const client = req.client;

    const error = validationResult(req).formatWith(({msg})=>{return msg;});

    if (!error.isEmpty()) {
        res.status(422).json({
            msg:"tidak dapat melanjutkan proses",
            response:error.mapped()
        })
        return;
    }

    const message = req.body.message;
    const number = phoneFormatter(req.body.number);
    const Registered =  await checkRegisteredNumber(client,number);

    if (!Registered) {
        return res.status(422).json({
            msg:'nomor belum terdaftar di whatsapp'
        });
    }

    
    var contentFile = "tidak ada file";
    let caption = req.body.caption ? req.body.caption : message;
    
    if(req.files)
    {
        contentFile = req.files.file;
        media = new MessageMedia(contentFile.mimetype, contentFile.data.toString('base64'), contentFile.name);
        waSend = client.sendMessage(number, media, {
            caption: caption
          });
    }else if(req.body.file){
        contentFile = req.body.file
        let mimetype;
        const attachment = await axios.get(contentFile, {
            responseType: 'arraybuffer'
        }).then(response => {
            mimetype = response.headers['content-type'];
            return response.data.toString('base64');
        });

        media = new MessageMedia(mimetype, attachment, 'Media');

        waSend = client.sendMessage(number, media, {
            caption: caption
          });
    }else{
        waSend = client.sendMessage(number, message);
    }

    waSend
    .then(response => {
        console.log(" sukses send message",response);
        res.status(200).json({
            msg:'success',
            response:response
        })
    }).catch(err => {
        console.log(" failed send message",err);
        res.status(500).json({
            msg:'failed',
            response:err
        })
    });

}

exports.addUser = async (req,res)=>{
    const error = validationResult(req).formatWith(({msg})=>{return msg;});

    if (!error.isEmpty()) {
        res.status(422).json({
            msg:"tidak dapat melanjutkan proses",
            response:error.mapped()
        })
        return;
    }

    hashedPW = await bcrypt.hash(req.body.password,10);

    const item = {
        name:req.body.name,
        email:req.body.email,
        password:hashedPW
    }

    UserModels.create(item, (err,success)=>{
        if (err){
            res.status(500).json({
                errors:err
            });
            console.log(err);
            return;
        }

        res.json({
            message:"created successfully",
            data:success
        })
    })
}
