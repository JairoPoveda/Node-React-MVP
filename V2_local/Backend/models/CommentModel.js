module.exports = (sequelize, Sequelize) => {
    const Comments = sequelize.define( 'comments', {
        username: {
            type: Sequelize.STRING
        },
        comment: {
            type: Sequelize.STRING
        },
        upvote: {
            type: Sequelize.INTEGER
        }
    });
  
    return Comments;
};