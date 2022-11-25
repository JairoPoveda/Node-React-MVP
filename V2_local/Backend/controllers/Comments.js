const db = require('../config/Database.js');
const Comments = db.comments;
const Replies = db.replies;
const path = require('path');

// Image url to be used in Frontend
const imgDir = 'http://localhost:5000/images/user_images/';

exports.getComments = async(req, res) => { 
    
    // Getting username randomly from user image directory of server, this name is embedded  implicitly in the jade file to store user comment        
    var userMax = 6;
    var userMin = 0;
    var randUserNum = Math.floor(
        Math.random() * (userMax - userMin) + userMin
    );
    const userImageDir = path.join(__dirname, '../public/images/user_images/');
    const fs = require('fs');
    var files = fs.readdirSync(userImageDir);
    var randUsername = files[randUserNum].replace('.png', '');
    
    // Getting the comments and Sending it to Frontend
    await Comments.findAll()
        .then(data => {
            // getting all comments
            var comments = data.map((c) => {
                var values = c.dataValues;
                // getting the difference between current time and created time
                var now = new Date();
                var diffTime = Math.abs(now - values.createdAt);
                diffTime = Number(diffTime/1000);
                
                var d = Math.floor(diffTime / (3600*24));
                var h = Math.floor(diffTime % (3600*24) / 3600);
                var m = Math.floor(diffTime % 3600 / 60);
                var s = Math.floor(diffTime % 60);
                
                // Formatting difference time 
                var diff = '';
                if(d > 0) {
                    if (d == 1) {
                        diff = 'Yesterday';
                    } else {
                        var week = d / 7;   // get integer not float
                        if (week > 1) {
                            console.log(week,'------', Math.floor(week));
                            diff = Math.floor(week) + (Math.floor(week) == 1 ? 'week' : 'weeks');
                        } else {
                            diff = d + 'days';
                        }
                    }
                } else {
                    if (h > 0) {
                        diff = h == 1 ? '1hr' : h + 'hrs';
                    } else {
                        if (m > 0) {
                            diff = m == 1 ? '1min' : m + 'mins'; 
                        } else {
                            diff = s + 's';
                        }
                    }
                }
                
                values.time = diff;

                if(values.upvote == 0) {
                    values.upvote = '';
                }

                // removing unnecessary values in JSON object to decrease the transfer amount of data in backend
                delete values.createdAt;
                delete values.updatedAt;
                
                return values;
            });            
            
            // get replies per every comment            
            res.send({ randUsername: randUsername, comments: comments, imgDir: imgDir });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving DB"
            });
        });  
}

exports.storeComment = (req, res) => {  
    
    var username = req.body.username;  
    var comment_text = req.body.comment_text;
    
    // create comment into DB
    const comment = {
        username: username,
        comment: comment_text,
        upvote: 0
    };
    Comments.create(comment).then(data => {
        res.send({ message: 'success'});
    })
    .catch(err => {
        res.status(500).send({
        message:
            err.message || 'Some error occurred while creating the Comments.'
        });
    });
}

exports.storeReply = (req, res) => {
    const id = req.body.id;
    const repliedUsername = req.body.username;
    const comment = req.body.comment_text;
    
    // create reply into DB
    const reply = {
        receivedID: id,
        repliedUsername: repliedUsername,
        comment: comment,
        upvote: 0
    };
    Replies.create(reply).then(data => {
        console.log('Successed to store reply');
    }).catch(err => {
        res.status(500).send({
        message:
            err.message || 'Some error occurred while creating the Comments.'
        });
    });

    res.send({id:id});
}

exports.replyList = async (req, res) => {
    const receivedID = req.body.id;
    
    // Getting replies 
    await Replies.findAll({where: {receivedID: receivedID}}).then(data => {        
        const replies = data.map((r) => {        
            var values = r.dataValues;
            // get the difference between current time and created time
            var now = new Date();
            var diffTime = Math.abs(now - values.createdAt);
            diffTime = Number(diffTime/1000);
            
            var d = Math.floor(diffTime / (3600*24));
            var h = Math.floor(diffTime % (3600*24) / 3600);
            var m = Math.floor(diffTime % 3600 / 60);
            var s = Math.floor(diffTime % 60);
            
            // Formatting difference time 
            var diff = '';
            if(d > 0) {
                if (d == 1) {
                    diff = 'Yesterday';
                } else {
                    var week = d / 7;
                    if (week > 1) {
                        diff = Math.floor(week) + (Math.floor(week) == 1 ? 'week' : 'weeks');
                    } else {
                        diff = d + 'days';
                    }
                }
            } else {
                if (h > 0) {
                    diff = h == 1 ? '1hr' : h + 'hrs';
                } else {
                    if (m > 0) {
                        diff = m == 1 ? '1min' : m + 'mins'; 
                    } else {
                        diff = s + 's';
                    }
                }
            }

            values.time = diff;

            if(values.upvote == 0) {
                values.upvote = '';
            }

            // remove unnecessary values in JSON object to decrease the transfer amount of data in backend
            delete values.createdAt;
            delete values.updatedAt;

            return values;            
        });

        res.send({imgDir:imgDir, replies: replies});      
        
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving DB"
        });
    });    
}
