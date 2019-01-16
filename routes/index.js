const express = require('express');
const router = express.Router();

const log = require('../helpers/loger');
const Count = require('../models/visitor-counts');

/* GET home page. */
router.get('/', (req, res, next) => {
  // log.success(req.headers);
  // res.status(200).json({
  //   message: "Server running.",
  //   request_time: req.requestTime
  // });
  const count = new Count({
    ip: req.ip,
    date: Date.time()
  });
  count.save((err, doc) => {
    if (err) {
      log.error("Error during record insertion : " + err);

      return;
    }
    log.success(doc);
  });

  Count.find()
  .select('-__v')
  .exec()
  .then((docs) => {
    res.render('index.html', { pageCountMessage : docs.length, dbInfo: res.dbDetails });
  })
  .catch((error) => {
    res.render('index.html', { pageCountMessage : null});
  });

  // if (res.db) {
  //   var col = res.db.collection('counts');
  //   col.insertOne({ ip: req.ip, date: Date.now() });
  //   col.countDocuments((err, count) => {
  //     if (err) {
  //       console.log('Error running count. Message:\n' + err);
  //     }
  //     res.render('index.html', { pageCountMessage : count, dbInfo: res.dbDetails });
  //   });
  // } else {
  //   res.render('index.html', { pageCountMessage : null});
  // }
});

router.get('/pagecount', (req, res, next) => {
  Count.find()
  .select('-__v')
  .exec()
  .then(docs => {
    const response = {
      requestTime: req.requestTime,
      pageCount: docs.length,
      pageVisitor: docs.map(doc => {
        return {
          id: doc._id,
          ip: doc.ip,
          timestamp: doc.date
        };
      })
    };
    res.status(200).json(response);
  })
  .catch(error => {
    const response = {
      requestTime: req.requestTime,
      pageCount: -1,
      error: error
    };
    res.status(200).json(response);
  });
  // if (res.db) {
  //   res.db.collection('counts').countDocuments((err, count ) => {
  //     res.status(200).json({
  //       pageCount: count,
  //       requestTime: req.requestTime
  //     });
  //   });
  // } else {
  //   res.status(200).json({ pageCount: -1 });
  // }
});

module.exports = router;