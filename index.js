const express     = require("express"),
      app         = express(),
      http        = require("http").Server(app),
      io          = require("socket.io")(http),
      morgan      = require("morgan"),
      bodyParser  = require("body-parser"),
      mongoose    = require("mongoose"),
      path        = require("path");

Object.assign = require('object-assign');
Date.prototype.toUnixTime = function() {
  return (this.getTime() / 1000) | 0;
};
Date.time = function() {
  return new Date().toUnixTime();
};

// Helper & Config
const log = require("./helpers/loger");
const config = require("./config.json");

app.engine('html', require('ejs').renderFile);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

process.env.JWT_KEY = config.jwtk;
const isDev = config.mode === "development" ? true : false;
process.env.MONGO_URL = isDev ? config.db.local : config.db.remote;

let port      = process.env.PORT || config.port,
    ip        = process.env.IP   || config.host,
    mongoURL  = process.env.MONGO_URL;
let db        = null,
    dbDetails = new Object();

mongoose.set("useCreateIndex", true);
mongoose.connect(mongoURL, { useNewUrlParser: true }, (err, conn) => {
  if (err) { log.error('Error in connection: ' + err); return; }
  
  db = conn;
  dbDetails.databaseName = db.databaseName;
  dbDetails.url = mongoURL.replace('davchezt:4Bahagia4', 'xxx:xxx');
  dbDetails.type = 'MongoDB';
  dbDetails.remote = !isDev;
});
mongoose.Promise = global.Promise;

// Routers
const indexControllers = require("./routes/index");
const chatsControllers = require("./routes/chat");

// app.use(morgan("dev"));
// app.use(morgan('combined'));
app.use(morgan('combined', {
  skip: (req, res, next) => { return res.statusCode < 400 }
}));

// Middleware
const requestMiddleware = (req, res, next) => {
  req.requestTime = Date.now();
  res.db = db; // for using without mongoose
  res.dbDetails = dbDetails;
  next();
}

app.use(requestMiddleware);
app.use("/uploads", express.static("uploads"));
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("json spaces", 2); // pretty print

app.use("/", indexControllers);
app.use("/chat", chatsControllers);

// Socket chat
let clients = [],
    in_room = [];
const Chat = require("./models/chat");
io.on("connection", (socket) => {

  socket.on("disconnect", () => {
    clients = [];
    Object.keys(io.sockets.sockets).forEach(function(id) {
      clients.push({
        id: id,
        nickname: io.sockets.sockets[id].nickname
      });
    });
    io.emit("users-changed", { user: socket.nickname, connectedUser: clients, event: "left" });
  });

  socket.on("set-nickname", (nickname) => {
    socket.nickname = nickname;
    clients = [];
    Object.keys(io.sockets.sockets).forEach(function(id) {
      clients.push({
        id: id,
        nickname: io.sockets.sockets[id].nickname
      });
    });
    io.emit("users-changed", { user: nickname, connectedUser: clients, event: "joined" });
  });

  // Visit Chat page
  socket.on("enter-room", () => {
    if (in_room.length === 0) {
      in_room.push(socket.nickname);
    } else {
      Object.keys(in_room).forEach(function() {
        if (in_room.indexOf(socket.nickname) === -1) in_room.push(socket.nickname);
      });
    }
    io.emit("in-room", { user: socket.nickname, connectedUser: in_room, event: "joined" });
  });

  // Leave Chat page
  socket.on("leave-room", () => {
    Object.keys(in_room).forEach(function(id) {
      if (in_room[id] == socket.nickname) in_room.splice(id, 1);
    });
    in_room = in_room.filter((v,i) => in_room.indexOf(v) === i)
    io.emit("in-room", { user: socket.nickname, connectedUser: in_room, event: "left" });
  });

  // For notify other user outside Chat page
  socket.on('new-message', () => { io.emit("new_message", socket.nickname); });

  // Sumbit new Chat message
  socket.on("add-message", (message) => {
    const chat = new Chat({
      _id: mongoose.Types.ObjectId(),
      text: message.text,
      from: socket.nickname,
      created: Date.time()
    });
    chat.save((err, doc) => {
      if (err) { log.error("Error during record insertion : " + err); return; }

      io.emit("message", { text: message.text, from: socket.nickname, created: Date.time() });
    });
  });
  
  socket.on("start-typing", (message) => {
    socket.form = message.form;
    io.emit("start_typing", { from: socket.nickname, to: socket.form });
  });

  socket.on("stop-typing", (message) => {
    socket.form = message.form;
    io.emit("stop_typing", { from: socket.nickname, to: socket.form });
  });
});

// Handle 404
app.use((req, res, next) => {
  const error = new Error("Error 404");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
  log.error("get " + error.message);
});

http.listen(port, ip, () => {
  log.success('listening at ' + ip + ' port: ' + port);
});

module.exports = app;