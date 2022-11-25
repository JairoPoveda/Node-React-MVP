import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';

const ReplyList = (props) => {
    const id = props.userID;
    const socket = props.socket;

    const [replies, setReplies] = useState([]);
    const [imgDir, setImgDir] = useState();

    // refs of spans to show updated upvote value in list of reply    
    const upvoteReplyRef = useRef([]); 
    
    const AUTHORITY = 'http://localhost:5000';
    
    useEffect(() => {
        axios.post(AUTHORITY+'/replyList', {'id': id})
            .then(res => {
                const imgDir = res.data.imgDir;       
                const replies = res.data.replies;
                     
                setImgDir(imgDir);
                setReplies(replies);                  
            });
    }, []);
         
    const upvoteHandler = (id, rid, index) => {
        const data = {'id' : id, rid : rid, 'index' : index};        
        socket.emit('update_reply_upvote', data);
    }    

    socket.on('update_reply_upvote', (data)=>{
        var replyID = data.id;          // parent user ID
        var index = data.index;         // ref index
        var value = data.value;         // updated value
        
        if(replyID == id){                 
            upvoteReplyRef.current[index].textContent = ' ' + value;
        }        
    });

    return (        
        <div className="list-block no-border">
        {
            replies.length > 0 ?
                replies.map((r, index) =>(
                    <div className="list-item" key={index}>            
                        <div className="user-part">
                            <img src={imgDir+r.repliedUsername+".png"} alt="user photo" />
                        </div>
                        <div className="comment-reply-part">
                            <div className="username">
                                <span className="name"><strong>{r.repliedUsername}</strong></span>
                                <span className="centerDot"><strong>{'\u25cf'}</strong></span>
                                <span className="time">{r.time}</span> ago
                            </div>
                            <div className="text">
                                {r.comment}
                            </div>
                            <div className="upvote-reply">
                                <a onClick={() => upvoteHandler(id, r.id, index)}>&#9650; Upvote
                                    <span ref={(ele) => upvoteReplyRef.current[index]= ele}> {r.upvote}</span>
                                </a>
                                <a >Reply</a>
                            </div>        
                        </div>
                    </div>
                )) : null
        }
        </div>
    )
}

export default ReplyList;