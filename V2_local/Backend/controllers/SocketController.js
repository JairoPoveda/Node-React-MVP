const db = require('../config/Database.js');
const Comments = db.comments;
const Replies = db.replies;

exports.realTimeUpvote = (socket) => {     
    console.log('Connected Socket ID : ', socket.id);
       
    socket.on('update_upvote', async(data) => {
        const id = data.id;
        const index = data.index;
        
        var comment = await Comments.findOne({
            where: {id: id}
        });
        
        var updatedValue = comment.dataValues.upvote + 1;
        // This project is using the sequelize v.6.20.1
        // So, upsert() is possible. If sequelize version is lower than 6, must update sequelize version.
        await Comments.upsert({
            id:id,
            upvote: updatedValue
        });
          
        socket.emit('update_upvote', { index:index, value: updatedValue });
        socket.broadcast.emit('update_upvote', { index:index, value: updatedValue }); // sending upvate value to everyone
    });

    socket.on('update_reply_upvote', async(data) => {
        const id = data.id;
        const rid = data.rid;
        const index = data.index;
        
        var reply = await Replies.findOne({
            where: {id: rid}
        });
        var updatedValue = reply.dataValues.upvote + 1;
        
        // This project is using the sequelize v.6.20.1
        // So, upsert() is possible. If sequelize version is lower than 6, must update sequelize version.
        await Replies.upsert({
            id:rid,
            upvote: updatedValue
        });    
            
        socket.emit('update_reply_upvote', { id:id, index:index, value: updatedValue});
        socket.broadcast.emit('update_reply_upvote', { id:id, index:index, value: updatedValue }); // sending upvate value to everyone
    });

    //when the user exits the room
    socket.on("disconnect", () => {
        console.log('Client was disconnected.');
    });
}