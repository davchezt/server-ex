const express = require('express');
const router = express.Router();

const log = require('../helpers/loger');
const checkAuth = require('../middleware/check-auth');
const Chat = require("../models/chat");

/* GET home page. */
router.get('/', (req, res, next) => {
  // log.success(req.headers)
  Chat.find()
  .select("from text created")
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      chats: docs.map(doc => {
        return {
          from: doc.from,
          text: doc.text,
          created: doc.created
        };
      })
    };
    res.status(200).json(response);
  })
  .catch(err => {
    log.error(err);
    res.status(500).json({
      error: err
    });
  });
});

router.post("/", checkAuth, (req, res, next) => {
  Chat.deleteMany({}, () => {
    log.success("ChatRoom cleared");
    res.status(200).json({ message: "ChatRoom cleared" });
  }).catch(err => {
    log.error(err);
    res.status(500).json({ error: err });
  });
});

router.get("/clear", (req, res, next) => {
  Chat.deleteMany({}, () => {
    log.success("ChatRoom cleared");
    res.status(200).json({ message: "ChatRoom cleared" });
  }).catch(err => {
    log.error(err);
    res.status(500).json({ error: err });
  });
});

module.exports = router;