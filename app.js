require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
const fileUpload = require("express-fileupload");
const http = require("http");
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:8000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const routes = require("./routes/web");
const myAuth = require("./routes/auth");

require("./init/wa").strater(io);
require("./init/mongoose");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ debug: true }));
app.use((req, res, next) => {
  req.io = io;
  next();
});

myAuth(app);
app.use(routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

server.listen("4000", () => {
  console.log("server started");
});

module.exports = app;
