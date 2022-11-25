Standalone app that represents a single article page, and allows someone to submit comments and replies-to-comments, as well as upvote any comments they like. 
Allowed submitting a new comment or upvote without account authentication.

Not nest of comments, only single list.

Stack : Node + Jade (View) + MySQL

# Backend - Express 4.16.1

Backend was created by express-generator. There is one table in DB.

- Routing ( routes/index.js )

    There are 4 routers.
    
      ....
      const Comments = require('../controllers/Comments.js');

      router.get('/', Comments.getComments);
      router.post('/storeComment', Comments.storeComment);
      router.post('/storeUpvote', Comments.storeUpvote);
      ....
      
- Database Config :
    Allowed to access one table by using Sequelize.

    ----- config/Database.js  
    
  
- Models :
    There is a DB model.

    DB models ----- models/CommentModel.js
    
        Comment Model has username, comment, upvote values.    
        
        
- Controller
      
  There is one controller named "Comment.js". ( controllers/Comments.js )
    
    - getComments 

      Get all comments (username, comment) to load in the frontend page. 
      
      There are 6 user images in 'public/images/user_images', and in this controller, selected the random user image, and sent the user name got from the image name.
              
            ......
            var userMax = 6;
            var userMin = 0;
            var randUserNum = Math.floor(
                Math.random() * (userMax - userMin) + userMin
            );
            const userImageDir = path.join(__dirname, '../public/images/user_images/');
            const fs = require('fs');
            var files = fs.readdirSync(userImageDir);
            var randUsername = files[randUserNum].replace('.png', '');
            .....

        So once page load or refresh, the random username would be sent to Frontend. Every name is related on the own photo. Therefore, can show the user with fixed photo.
        Calculated the difference time between created and current, and formatted by description.
        
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
                
     - storeComment
     
        Store username, comment from "submit" event of "comment" form of Frontend.
        
     - storeUpvote

        Store upvote value of user received upvoting, and return updated upvote value.
        
     
     
# Frontend - Jade 0.29.0

This app is a single-page app. Implemented page in Jade of View directory.

When page load, coming all comments data from Backend. 

The comments are array format, so I displayed the every comment by looping. 

Also, there is one JS file in public/javascripts directory and one CSS in public/stylesheets directory.

JS is to implement ajax to send upvote.

        function upvote(id){
    
            $.ajax({
                type: 'POST',
                url: '/storeUpvote',
                data: JSON.stringify({
                    'userID': id
                }),
                dataType: "json",
                contentType: "application/json",        
                success: function(data){
                    var id = data.id;            // upvoted user id
                    var value = data.value;      // updated upvote value      
                    const upvote = document.getElementById('upvoteID-'+id);     // span element to show updated upvote value
                    upvote.textContent = value;
                },
                error: function(e) {
                  console.log(e);
                }        
            });
        }


For the reference, I commented in source code.
        







