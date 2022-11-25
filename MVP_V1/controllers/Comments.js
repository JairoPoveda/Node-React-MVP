const db = require('../config/Database.js');
const Comments = db.comments;
const path = require('path');

exports.getComments = (req, res) => {    
    Comments.findAll()
        .then(data => {
            // get username randomly from user image directory of server, this name is embedded  implicitly in the jade file to store user comment        
            var userMax = 6;
            var userMin = 0;
            var randUserNum = Math.floor(
                Math.random() * (userMax - userMin) + userMin
            );
            const userImageDir = path.join(__dirname, '../public/images/user_images');
            const fs = require('fs');
            var files = fs.readdirSync(userImageDir);
            var randUsername = files[randUserNum].replace('.png', '');

            // get all comments
            var comments = data.map((c) => {
                var values = c.dataValues;
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
                            diff = week + 'weeks';
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
                
                // In jade, to parse JSON object is needed to stringify this JSON element -- *important
                return JSON.stringify(values);
            });
             
            res.render('index', { randUsername: randUsername, comments: JSON.stringify(comments) });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving DB"
            });
        });        
    //res.render('index', { title: 'Express' });
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
        res.redirect('/');
    })
    .catch(err => {
        res.status(500).send({
        message:
            err.message || "Some error occurred while creating the Tutorial."
        });
    });
}

exports.storeUpvote = async(req, res) => {
    const id = req.body.userID;
    
    var comment = await Comments.findOne({
        where: {id: id}
    });
    var old_upvote = comment.dataValues.upvote;
    
    // This project is using the sequelize v.6.20.1
    // So, upsert() is possible. If sequelize version is lower than 6, must update sequelize version.
    await Comments.upsert({
        id:id,
        upvote: old_upvote + 1
    });    
        
    res.send({id: id, value: old_upvote+1}); // return JSON string
}
