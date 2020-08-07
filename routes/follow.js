const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Follow = require('../models/follow');
const checkAuth = require('../middleware/check-auth');

router.post('/', checkAuth, async(req, res, next) => {
  const follow = new Follow({
    _id: new mongoose.Types.ObjectId(),
    created: Date.now(),
    user: req.body.uid,
    target: req.body.to
  });
  follow.save((err, doc) => {
    if (err) { log.error("Error during record insertion : " + err); return; }
    // console.log(doc);
    res.status(200).json({
      message: "success!"
    })
  })
});

router.get('/following', (req, res, next) => {
  console.log(req.body)
  Follow.find({ user: req.body.uid })
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      following: docs.map(doc => {
        return {
          target: doc.target,
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

router.get('/follower', (req, res, next) => {
  console.log(req.body)
  Follow.find({ target: req.body.uid })
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      follower: docs.map(doc => {
        return {
          user: doc.user,
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

module.exports = router;