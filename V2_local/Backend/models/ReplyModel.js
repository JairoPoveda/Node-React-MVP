module.exports = (sequelize, Sequelize) => {
    const Replies = sequelize.define( 'replies', {
        receivedID: {
            type: Sequelize.INTEGER
        },
        repliedUsername: {
            type: Sequelize.STRING
        },
        comment: {
            type: Sequelize.STRING
        },
        upvote: {
            type: Sequelize.INTEGER
        }
    });
  
    return Replies;
};