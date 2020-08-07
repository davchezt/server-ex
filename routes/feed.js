const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, /*new Date().toISOString()*/"uploads-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

// Models
const Post = require('../models/post');
const Feed = require('../models/feed');
const Follow = require('../models/follow');
const checkAuth = require('../middleware/check-auth');

router.post('/new', checkAuth, upload.single('image'), async(req, res, next) => {
  let post = await Post.create({
    _id: new mongoose.Types.ObjectId(),
    user: req.body.uid,
    text: req.body.text,
    image: req.file ? req.file.path.replace(/\\/g, '/'):'',
    created: Date.time()
  });

  let follows = await Follow.find({ target: req.body.uid }).exec();

  let newFeeds = follows.map(follow => {
    //console.log(follow)
    return {
      _id: new mongoose.Types.ObjectId(),
      owner: follow.user,
      post: post.id
    }
  });
  await Feed.insertMany(newFeeds).then(data => {
    //console.log(data);
    res.status(200).json({
      status: "ok"
    });
  });

});

router.get('/:userId/count', async(req, res, next) => {
  let follows = await Follow.find({ user: req.params.userId }).exec();
  let followings = follows.map(follow => follow.target);
  let feeds = await Post.find({$or:[{user: followings}, {user: req.params.userId}]})
  .exec()
  .then(docs => {
    const response = {
      count: docs.length
    };
    res.status(200).json(response);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

router.get('/:userId', async(req, res, next) => {
  //console.log(req)
  let follows = await Follow.find({ user: req.params.userId }).exec();
  let followings = follows.map(follow => follow.target);
  let feeds = await Post.find({
    $or:[{
      user: followings
    }, {
      user: req.params.userId
    }]
  }).populate({
    path: 'user',
    select: 'email profile',
    model: 'User',
    populate: {
      path: 'profile',
      select: '-_id -__v',
      model: 'Profile'
    }
  })
  .sort({'created': -1})
  //.skip(parseInt(req.query.start)) // start
  .limit(parseInt(req.query.limit)) // limit
  .exec()
  .then(docs => {
    //console.log(docs)
    const response = {
      count: docs.length,
      feeds: docs.map(doc => {
        return {
          id: doc._id,
          user: doc.user,
          text: doc.text,
          image: doc.image,
          created: doc.created
        };
      })
    };
    res.status(200).json(response);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

router.get('/:userId/following', async (req, res, next) => {
  Feed.find({ owner: req.params.userId })
  .populate('post')
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      feeds: docs.map(doc => {
        return {
          owner: doc.owner,
          post: doc.post
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