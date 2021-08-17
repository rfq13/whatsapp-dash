const { Client, Location } = require("whatsapp-web.js");
const fs = require("fs");
const Session = require("../models/Sessions");
const qrcode = require("qrcode");
const getSession = async (id) => await Session.findById(id).exec();
const getAllSessions = async () => await Session.find();
const client = "kempung";
const { output } = require("../helpers/learnReplies");
let whatsapp = {};
const strater = (io) => {
  const createClient = async (data) => {
    await Session.create(data, async (err, success) => {
      result = {
        success: false,
        user_id: data.user_id,
        description: data.description,
      };

      if (err) {
        result.message = err;
      } else {
        await createSession(success._id, result.description);
        result.success = true;
        result.message = success;
      }

      io.emit("create-client", result);
    });
  };

  const createSession = async function (id) {
    let sessionCfg = null;
    const doc = await Session.findOne({ _id: id });
    console.log("Creating session: " + id);
    const result = await Session.check({ _id: id });
    if (result) {
      resultClient = await getSession(id);
      if (resultClient.client) {
        sessionCfg = JSON.parse(resultClient.client);
      }
    }
    console.log(sessionCfg, "session cfg");
    const client = new Client({
      restartOnAuthFail: true,
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process", // <- this one doesn't works in Windows
          "--disable-gpu",
        ],
      },
      session: sessionCfg,
    });

    client.on("qr", async (qr) => {
      console.log("QR ", qr);
      const cekClient = await Session.check({ _id: id });
      if (cekClient) {
        qrcode.toDataURL(qr, (err, url) => {
          io.emit("qr", { id: id, src: url });
          io.emit("message", { id: id, text: "QR Code received, scan please!" });
        });
      }
      // else{
      //   client.logout();
      // }
    });

    client.on("ready", () => {
      io.emit("ready", { id: id });
      io.emit("message", { id: id, text: "Whatsapp is ready!" });

      if (result) {
        doc.ready = true;
        doc.save();
      }
    });

    client.on("authenticated", (session) => {
      io.emit("authenticated", id);
      io.emit("message", { id: id, text: "Whatsapp is authenticated!" });
      sessionCfg = session;
      if (result) {
        doc.client = JSON.stringify(session);
        doc.save();
        whatsapp[id] = client;
      }
    });

    client.on("message", async (msg) => {
      const chat = await msg.getChat();

      if (msg.body == "!ping") {
        msg.reply("pong");
      } else if (msg.body == "!groups") {
        client.getChats().then((chats) => {
          const groups = chats.filter((chat) => chat.isGroup);

          if (groups.length == 0) {
            msg.reply("You have no group yet.");
          } else {
            let replyMsg = "*YOUR GROUPS*\n\n";
            groups.forEach((group, i) => {
              replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
            });
            replyMsg += "_You can use the group id to send a message to the group._";
            msg.reply(replyMsg);
          }
        });
        // } else if (msg.body === '!location') {
        //   msg.reply(new Location(-7.322956673591686, 112.76473464992037, 'Revo Apps\nSurabaya'));
        // } else if (msg.location) {
        //     msg.reply(msg.location);
      } else if (msg.body.startsWith("!status ")) {
        const newStatus = msg.body.split(" ")[1];
        await client.setStatus(newStatus);
        msg.reply(`Status was updated to *${newStatus}*`);
      } else if (msg.body === "!mention") {
        const contact = await msg.getContact();
        chat.sendMessage(`Hi @${contact.number}!`, {
          mentions: [contact],
        });

        // }else if (msg.body === '!evilmorn') {
        //   const chatGroup = await client.getChatById('6281232072122-1617437698@g.us');
        //   chatGroup.addParticipants([msg.from]);
        //   chat.sendMessage(`Hei, you added to group  evilmorning`);
      } else {
        const reply = await output({ text: msg.body, user: doc.user_id });
        chat.sendMessage("" + reply);
      }
    });

    client.on("change_state", async (change_state) => {
      console.log("WhatsApp: Device", change_state);
      if (change_state == "PAIRING") {
        doc.client = null;
        doc.ready = false;
        doc.save();

        client.destroy();
        client.initialize();
      }
      io.emit("message", { id: id, text: "WhatsApp: Device " + change_state });
    });

    client.on("auth_failure", function (session) {
      io.emit("message", { id: id, text: "Auth failure, restarting..." });
    });

    client.on("disconnected", async (reason) => {
      io.emit("message", { id: id, text: "Whatsapp is disconnected!", reason });
      if (await Session.check({ _id: id })) {
        doc.client = null;
        doc.ready = false;
        doc.save();

        client.destroy();
        client.initialize();
      }
      io.emit("remove-session", id);
    });

    client.initialize();
  };

  const init = async function (socket) {
    const savedSessions = await Session.find({});

    if (savedSessions.length > 0) {
      if (socket) {
        socket.emit("init", savedSessions);
      } else {
        savedSessions.forEach((sess) => {
          createSession(sess._id, sess.description);
        });
      }
    }
  };

  init();

  // Socket IO
  io.on("connection", function (socket) {
    init(socket);

    socket.on("create-session", async function (data) {
      createClient(data);
    });

    socket.on("remove-session", async function (data) {
      // const doc = await Session.findOne({_id:data});
      console.log("removing session: " + data);
      const result = await Session.check({ _id: data });
      console.log(result);
      if (result) {
        const client = whatsapp[data];

        if (client) {
          client.logout();
          client.destroy();
        }

        const res = await Session.deleteOne({ _id: data });
        console.log("nih setelah di hapus", res);
        io.emit("create-client");
        init();
      }
    });
    socket.on("logout", async function (data) {
      // const doc = await Session.findOne({_id:data});
      console.log("removing session: " + data);
      const result = await Session.check({ _id: data });
      console.log(result);
      if (result) {
        const client = whatsapp[data];

        if (client) {
          // client.logout();
          client.destroy();
        }

        // const res = await Session.deleteOne({ _id: data });
        // console.log('nih setelah di hapus',res);
        io.emit("create-client");
        init();
      }
    });
  });
};

module.exports = { strater, getAllSessions };
