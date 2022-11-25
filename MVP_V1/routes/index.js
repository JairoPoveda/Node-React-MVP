var express = require('express');
var router = express.Router();

const Comments = require('../controllers/Comments.js');

router.get('/', Comments.getComments);
router.post('/storeComment', Comments.storeComment);
router.post('/storeUpvote', Comments.storeUpvote);

module.exports = router;
