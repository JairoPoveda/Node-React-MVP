import '../App.css';
import React, {useState, useRef, createRef} from 'react';
import axios from 'axios';

const ReplyForm = (props) => {

    const randUserImg = props.randUserImg;
    const randUsername = props.randUsername;
    const receivedID = props.receivedID;

    const AUTHORITY = 'http://localhost:5000';

    const handleReplySubmit = async (event) => {
        event.preventDefault();
        const replyData = {...inputs, 'id': receivedID};
        try {
            await axios.post(AUTHORITY+'/storeReply', replyData)
                .then(res => {
                   window.location = '/';   // page reload
                });
        } catch (error) {
            console.log('store-post error ; ', error);
        }
    }

    const [inputs, setInputs] = useState({});

    const handleComment = (event) => {
        setInputs({'username': randUsername});
        const comment_text = event.target.value;
        setInputs(values => ({...values, 'comment_text' : comment_text}));
    }

    return(
        <form className="comment-form" onSubmit={handleReplySubmit}>
            <div className="user-part">
                <img src={randUserImg} alt="user photo" />
            </div>
            <div className="submit-part">
                <div className="text">
                    <input type="text" name="comment_text" onChange={handleComment} required />
                </div>
                <div className="btn">
                    <input type="submit" className="submit-btn" value="comment" />
                </div>
            </div>
        </form>
    )
}

export default ReplyForm;