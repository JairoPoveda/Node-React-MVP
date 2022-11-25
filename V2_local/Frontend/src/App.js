import './App.css';
import React, {useState, useRef, createRef} from 'react';
import axios from 'axios';
import io from "socket.io-client";
import ReplyForm from './component/ReplyForm.js';
import ReplyList from './component/ReplyList.js';

function App() {  
  const [randUsername, setRandUsername] = useState('');
  const [comments, setComments] = useState([]);
  const [imgDir, setImgDir] = useState([]);
  const [randUserImg, setRandUserImg] = useState('');

  // refs of spans to show updated upvote value
  // upvote event is ajax, so needed to update the upvote value without page reload after store updated-upvote value into DB. Below ref is used to update the span value(this span is element that show upvote value).
  const upvoteRef = useRef([]); 

  // refs of reply Form 
  // When the page load, created reply hidden forms.
  // When click "reply" in any comment, to show Form is needed to manipulate form attribute. So used these refs.
  const replyFormRef = useRef([]);
    
  // user id received reply
  const [receivedID, setReceivedID] = useState(0);

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
        const randUsername = res.data.randUsername;
        const comments = res.data.comments;
        const imgDir = res.data.imgDir;                
        const randUserImg = imgDir + randUsername + '.png';
        
        setRandUsername(randUsername);
        setComments(comments);
        setImgDir(imgDir);
        setRandUserImg(randUserImg);
        
        connectSocket();
    });    
  }, []);

  const connectSocket = () => {
    socket.current.on('connect', () => {
      console.log('Socket connected!');
    });

    socket.current.on('update_upvote', (data)=>{
      var index = data.index;
      var value = data.value;
      
      // set updated upvote value
      upvoteRef.current[index].textContent = ' ' + value;
    });
    
    socket.current.open();
  }

  const [inputs, setInputs] = useState({});

  const handleComment = (event) => {
    setInputs({'username': randUsername});
    const comment_text = event.target.value;
    setInputs(values => ({...values, 'comment_text' : comment_text}));
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(AUTHORITY+'/storeComment', inputs)
        .then(res => {
          window.location.reload(false);   // page reload
        });
    } catch (error) {
      console.log('store-post error ; ', error);
    }
  }

  const upvoteHandler = async (id, index) => {
    const userID = {'id' : id, 'index':index};    
    socket.current.emit('update_upvote', userID);    
  }  

  const [replyDisplayFlag, setreplyDisplayFlag] = useState(false);
  // set forcus of comment and user id received reply
  const replyHandler = (id, index) => {
    if(!replyDisplayFlag) {
      replyFormRef.current[index].style.display = 'block';
      setreplyDisplayFlag(true);
    } else {
      replyFormRef.current[index].style.display = 'none';
      setreplyDisplayFlag(false);
    }
    
    setReceivedID(id);
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Discussion</h1> 
        <div className="comment-block">
          <form className="comment-form" onSubmit={handleCommentSubmit}>
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
        </div>
        <div className="list-block">
          { comments.map((c, index) => 
            (
              <div className="list-item" key={index}>            
                <div className="user-part">
                    <img src={imgDir+c.username+".png"} alt="user photo" />
                </div>
                <div className="comment-reply-part">
                  <div className="username">
                    <span className="name"><strong>{c.username}</strong></span>
                    <span className="centerDot"><strong>{'\u25cf'}</strong></span>
                    <span className="time">{c.time}</span> ago
                  </div>
                  <div className="text">
                    {c.comment}
                  </div>
                  <div className="upvote-reply">
                    <a onClick={() => upvoteHandler(c.id, index)}>&#9650; Upvote                      
                      <span ref={(ele) => upvoteRef.current[index] = ele}> {c.upvote}</span>
                    </a>
                    <a onClick={() => replyHandler(c.id, index)}>Reply</a>
                  </div>
                  <div style={{display: 'none'}} ref={(ele) => replyFormRef.current[index] = ele}>
                    <ReplyForm
                      randUsername = {randUsername}
                      randUserImg = {randUserImg}
                      receivedID = {receivedID}
                    />
                  </div>

                  <ReplyList userID={c.id} socket={socket.current}/>

                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
