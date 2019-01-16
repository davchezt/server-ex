const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require('../models/user');
const Profile = require('../models/profile');
const checkAuth = require('../middleware/check-auth');

router.get("/", checkAuth, (req, res, next) => {
  User.find()
  .select("-password -__v")
  .populate('profile', '-_id -__v')
  .exec()
  .then(docs => {
    res.status(200).json({
      count: docs.length,
      users: docs.map(doc => {
        return {
          _id: doc._id,
          email: doc.email,
          profile: doc.profile,
          request: {
            type: "GET",
            url: "/user/" + doc._id
          }
        };
      })
    });
  })
  .catch(err => {
    res.status(500).json({
      error: err
    });
  });
});

router.get("/token", checkAuth, (req, res, next) => {
  res.status(200).json({
    message: 'token accepted'
  });
});

router.post("/signup", (req, res, next) => {
  User.find({
    email: req.body.email
  })
  .exec()
  .then(user => {
    if (user.length >= 1) {
      return res.status(409).json({
        message: "Mail exists"
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
        } else {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash,
            profile: new mongoose.Types.ObjectId(0)
          });
          user.save((err) => {
            if (err) console.log(err);
            const profile = new Profile({
              _id: new mongoose.Types.ObjectId(),
              name: req.body.name,
              gender: req.body.gender
            });
            profile.save().then(rest => {
              if (rest) {
                const token = jwt.sign({
                  email: user.email,
                  userId: user._id
                },
                process.env.JWT_KEY, {
                  expiresIn: "30d"
                });
                User.findOneAndUpdate({ _id: user._id }, { profile: rest._id }, { new: true }, (err, doc) => {
                  if (doc) {
                    return res.status(200).json({
                      message: "Register successful",
                      token: token,
                      uid: user._id
                    });
                  }
                });
              }
              // res.status(201).json({
              //   message: "User created"
              // });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              });
            });
          });
        }
      });
    }
  });
});

router.post("/login", (req, res, next) => {
  User.find({
    email: req.body.email
  })
  .exec()
  .then(user => {
    if (user.length < 1) {
      return res.status(401).json({
        message: "Auth failed"
      });
    }
    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
      if (err) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      if (result) {
        const token = jwt.sign({
          email: user[0].email,
          userId: user[0]._id
        },
        process.env.JWT_KEY, {
          expiresIn: "30d"
        });
        return res.status(200).json({
          message: "Auth successful",
          token: token,
          uid: user[0]._id
        });
      }
      res.status(401).json({
        message: "Auth failed"
      });
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

router.get("/:userId", checkAuth, (req, res, next) => {
  User.findById({
    _id: req.params.userId
  })
  //.select("-_id -password -__v")
  .populate('profile', '-_id -__v')
  .exec()
  .then(result => {
    res.status(200).json({
      data: result.profile
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

router.delete("/:userId", (req, res, next) => {
  User.remove({
    _id: req.params.userId
  })
  .exec()
  .then(result => {
    res.status(200).json({
      message: "User deleted"
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

module.exports = router;