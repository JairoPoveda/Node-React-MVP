
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
