var express = require('express');
var router = express.Router();

const Comments = require('../controllers/Comments.js');

router.get('/', Comments.getComments);
router.post('/storeComment', Comments.storeComment);
router.post('/storeReply', Comments.storeReply);
router.post('/replyList', Comments.replyList);

module.exports = router;
