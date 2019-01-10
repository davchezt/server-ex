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

app.engine('html', require('ejs').renderFile);

// Helper
const log = require("./helpers/loger");

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

process.env.JWT_KEY = "DaVchezt.4Bahagia4";
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV === "development" ? true : false;
process.env.MONGO_URL = isDev ? 'mongodb://localhost:27017/agrifarm':''; // mongodb://admin:admin123@ds123624.mlab.com:23624/agrifarm

let port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";
let db = null,
    dbDetails = new Object();

if (mongoURL == null) {
  let mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    let mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    let mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}

mongoose.set("useCreateIndex", true);
mongoose.connect(mongoURL, { useNewUrlParser: true }, (err, conn) => {
  if (err) {
    log.error('Error in connection: ' + err);
    
    return;
  }
  
  db = conn;
  dbDetails.databaseName = db.databaseName;
  dbDetails.url = mongoURLLabel ? mongoURLLabel : conn.client.s.url;
  dbDetails.type = 'MongoDB';
  log.success('Connected to MongoDB at: ' + conn.client.s.url);
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
let clients = [];
const Chat = require("./models/chat");
io.on("connection", (socket) => {

  socket.on("disconnect", () => {
    clients = [];
    Object.keys(io.sockets.sockets).forEach(function(id) {
      clients.push({
        id: id,
        nickname: io.sockets.sockets[id].nickname
      });
    })
    io.emit("users-changed", { user: socket.nickname, connectedUser: clients/*io.engine.clientsCount - 1*/, event: "left" });
  });

  socket.on("set-nickname", (nickname) => {
    socket.nickname = nickname;
    clients = [];
    Object.keys(io.sockets.sockets).forEach(function(id) {
      clients.push({
        id: id,
        nickname: io.sockets.sockets[id].nickname
      });
    })
    io.emit("users-changed", { user: nickname, connectedUser: clients/*io.engine.clientsCount*/, event: "joined" });
  });

  socket.on("set-room", (nickname) => {
    socket.to = nickname;
    io.emit("users-add", { user: nickname, event: "add" });
  });

  socket.on("add-message", (message) => {
    io.emit("message", {
      text: message.text,
      from: socket.nickname,
      created: Date.time()
    });
    const chat = new Chat({
      _id: mongoose.Types.ObjectId(),
      text: message.text,
      from: socket.nickname,
      created: Date.time()
    });
    chat.save((err, doc) => {
      if (err) {
        log.error("Error during record insertion : " + err);
      } else {
        log.success(doc);
      }
    });
  });

  socket.on("add-message-to", (message) => {
    io.emit("message-to", {
      text: message.text,
      from: socket.nickname,
      to: socket.to,
      created: new Date()
    });
  });

  socket.on("start-typing", (message) => {
    socket.to = message.receiverId;
    io.emit("start_typing", { from: socket.nickname, to: socket.to });
  });

  socket.on("stop-typing", (message) => {
    socket.to = message.receiverId;
    io.emit("stop_typing", { from: socket.nickname, to: socket.to });
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