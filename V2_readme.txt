# V2

Standalone app that represents a single article page, and allows someone to submit comments and replies-to-comments, as well as upvote any comments they like. 
Allowed submitting a new comment or upvote without account authentication.

Updated the back and front end to support 1 level of comment nesting.

Stack : Node + React + MySQL


# Backend - Express 4.16.1

Backend was created by express-generator.
There are 2 tables in DB, one is for comments and another is for replies. 

- env

        const dotenv = require('dotenv');
        dotenv.config();
        var port = normalizePort(process.env.PORT);
        app.set('port', port);

- Routing ( routes/index.js )

    There are 4 routers.

        ...
        const Comments = require('../controllers/Comments.js');

        router.get('/', Comments.getComments);
        router.post('/storeComment', Comments.storeComment);
        router.post('/storeReply', Comments.storeReply);
        router.post('/replyList', Comments.replyList);
        ...

- Database Config :
    Allowed to access 2 tables by using Sequelize.

    ----- config/Database.js


- Models :
    There are 2 DB models, and one Socket Model.

    DB models ----- models/CommentModel.js,   models/ReplyModel.js
    
        Comment Model has username, comment, upvote values.     
    
        Reply Model has username that received the reply, username replied, comment of reply, upvote of reply.
   

    Socket model ----- models/Socket.js
    
        Socket Model : HTTP Server Socket IO model
   
   
- Controller
      
  - Comments Controller ( controllers/Comments.js )
    
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
        
     - storeReply

        Store replier name, comment from "submit" event of "replies" form of Frontend.
        
     - replyList

        V2 has 1 level nest depth. So every comment can have the replies. These data are in replies table of DB and have the user ids received reply.
        
        Therefore, in this controller, get all replies of user received the reply. The difference time is same in getComments controller.
        
                
                
  - Socket Controller ( controllers/SocketController.js )

    There are 2 socket functions, update_upvote and update_reply_upvote.
    
    - update_upvote

        Socket is created at initializing the server. And this is connected with client when one access backend. 
        
        This function updates upvote value of user that received upvote about the comment. This value is in replies table of DB.
        After the update, send the updated value to every client via socket.
        
    - update_reply_upvote

        This function updates upvote value of user that received upvote about the reply of reply list. 
        This value is in replies table of DB.
        After the update, send the updated value to every client via socket.
        
        
        

# Frontend - React 18.2.0

This app is a single-page app. So there is no page router. Created main page in App.js and a Form component and a List component.

When page load, pull all comments from backend in App.js. And connected the socket with Backend.

Using ref to avoid losing the socket instance when DOM is re-rendered.

       
      .....
      const AUTHORITY = 'http://localhost:5000';

      // socket
      // Using ref to avoid losing the socket instance when DOM is re-rendered. 
      let socket = useRef(null);

      React.useEffect(() => {  
        socket.current = io(AUTHORITY, {
          autoConnect: false,
        });  

        axios.get(AUTHORITY)
          .then(res => {
      ....
      
      
There is a Form in the top of the page, which send the comment to the server.

In below of it, shows the comments and replies. The comments value is array, so loop index and render every component.

    ....
    <div className="list-block">
          { comments.map((c, index) => 
            (
              <div className="list-item" key={index}>     
    ....
    
Every comment has Upvote and Reply function. When client click upvote, increased the upvote value of DB and updated the value of Frontend.

To show real-time updated values used socket, and to manipulate DOM (to change the span value) used React refs array.

This refs array has the ref of every upvote value, so when clicking any upvote in the comments list, we can access the clicked upvote value by using this array.

    .....
    
    socket.current.on('update_upvote', (data)=>{
      var index = data.index;
      var value = data.value;
      
      // set updated upvote value
      upvoteRef.current[index].textContent = ' ' + value;
    });
    
    .....
    
    const upvoteHandler = async (id, index) => {
        const userID = {'id' : id, 'index':index};    
        socket.current.emit('update_upvote', userID);    
    }  
      
    .....
    
    <div className="upvote-reply">
        <a onClick={() => upvoteHandler(c.id, index)}>&#9650; Upvote                      
          <span ref={(ele) => upvoteRef.current[index] = ele}> {c.upvote}</span>
        </a>
        <a onClick={() => replyHandler(c.id, index)}>Reply</a>
    </div>
    
   ......
  

Added Form component that allowed to send reply about every comment. This form is hidden, only showing when clicked reply of comment. 

To change div attribute used ref array.

    <div style={{display: 'none'}} ref={(ele) => replyFormRef.current[index] = ele}>
      <ReplyForm
          randUsername = {randUsername}
          randUserImg = {randUserImg}
          receivedID = {receivedID}
      />
    </div>

Every comment can have its own replies, and replies may be several. So pulled data about each comment from the replies table in DB.

Passed commented user id and current socket to the component.

    <ReplyList userID={c.id} socket={socket.current}/>
    
There is an array of reply refs in this component, which has the ref of upvote value of every reply, so when clicking any upvote in the reply list, we can access the clicked upvote value of replies by using this array. 

This refs array has all replies of comments since it is in the loop of comments, so checked the comment user of reply, and only updated when the comment is the parent of reply.

    ....
    
     socket.on('update_reply_upvote', (data)=>{
        var replyID = data.id;          // parent user ID
        var index = data.index;         // ref index
        var value = data.value;         // updated value
        
        if(replyID == id){                 
            upvoteReplyRef.current[index].textContent = ' ' + value;
        }        
    });
    
    ....
    
    
Commented in source code for reference.

Thank you.

    










