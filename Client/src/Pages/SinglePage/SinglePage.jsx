import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { 
  FaMapMarkerAlt, 
  FaUser, 
  FaTimes, 
  FaPaperPlane, 
  FaStar, 
  FaDollarSign,
  FaRegBookmark,
  FaBookmark,
  FaCommentDots,
  FaWrench,
  FaPaw,
  FaMoneyBillWave,
  FaRulerCombined,
  FaBed,
  FaBath,
  FaSchool,
  FaBusAlt,
  FaUtensils,
  FaWifi,
  FaDog,
  FaBriefcase,
  FaShoppingCart,
  FaHospital,
  FaMapMarked,
  FaComment,
  FaHeart
} from "react-icons/fa";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  
  // Add state for message popup
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef();
  const inputRef = useRef();

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input field when popup opens
  useEffect(() => {
    if (showMessagePopup) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showMessagePopup]);

  // Check for existing chat or create new one
  const initializeChat = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    try {
      // Try to find existing chat with this user
      const chatsRes = await apiRequest.get("/chats");
      const existingChat = chatsRes.data.find(c => c.receiver.id === post.user.id);
      
      if (existingChat) {
        // If chat exists, load it
        const chatRes = await apiRequest.get("/chats/" + existingChat.id);
        setChat({
          id: existingChat.id,
          receiver: post.user,
          messages: chatRes.data.messages || []
        });
        setMessages(chatRes.data.messages || []);
        
        // Mark as read
        await apiRequest.put("/chats/read/" + existingChat.id);
      } else {
        // If no chat exists yet, just set up the UI
        setChat({
          id: null,
          receiver: post.user,
          messages: []
        });
        setMessages([]);
      }
      
      setShowMessagePopup(true);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (chat && socket) {
      socket.on("getMessage", (data) => {
        if (chat.id === data.chatId) {
          setMessages(prev => [...prev, data]);
          // Mark as read
          apiRequest.put("/chats/read/" + chat.id).catch(err => console.log(err));
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off("getMessage");
      }
    };
  }, [socket, chat]);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
    }
    // AFTER REACT 19 UPDATE TO USEOPTIMISTIK HOOK
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };
  
  const handleSendMessage = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (message.trim() === "") return;
    
    try {
      // If no chat exists yet, create one first
      if (!chat.id) {
        console.log('this runs')
        // Step 1: Create a chat with just the receiver ID
        const newChatRes = await apiRequest.post("/chats", {
          receiverId: post.userId
        });
        
        // Update chat state with the newly created chat
        const newChatId = newChatRes.data.id;
        
        // Step 2: Send the first message to the newly created chat
        const msgRes = await apiRequest.post("/messages/" + newChatId, { 
          text: message 
        });
        
        // Update state with the new chat and message
        setChat({
          id: newChatId,
          receiver: post.user,
          messages: [msgRes.data]
        });
        setMessages([msgRes.data]);
        
        // Notify the receiver via socket
        socket.emit("sendMessage", {
          receiverId: post.user.id,
          data: msgRes.data
        });
      } else {
        // For existing chats, just send the message
        const res = await apiRequest.post("/messages/" + chat.id, { text: message });
        setMessages(prev => [...prev, res.data]);
        
        // Notify receiver via socket
        socket.emit("sendMessage", {
          receiverId: post.user.id,
          data: res.data
        });
      }
      
      // Clear input
      setMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const getAvatarUrl = (user) => {
    return user?.avatar || null;
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <div className="iconWrapper">
                    <FaMapMarkerAlt />
                  </div>
                  <span>{post.address}</span>
                </div>
                <div className="price">
                  <div className="iconWrapper">
                    <FaDollarSign />
                  </div>
                  <span>{post.price}</span>
                </div>
              </div>
              <div className="user">
                {getAvatarUrl(post.user) ? (
                  <img src={getAvatarUrl(post.user)} alt={post.user.username} />
                ) : (
                  <div className="noAvatar">
                    <FaUser />
                  </div>
                )}
                <span>{post.user.username}</span>
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <div className="iconWrapper">
                <FaWrench />
              </div>
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <div className="iconWrapper">
                <FaPaw />
              </div>
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === "allowed" ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <div className="iconWrapper">
                <FaMoneyBillWave />
              </div>
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <div className="iconWrapper">
                <FaRulerCombined />
              </div>
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <div className="iconWrapper">
                <FaBed />
              </div>
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <div className="iconWrapper">
                <FaBath />
              </div>
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <div className="iconWrapper">
                <FaSchool />
              </div>
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school ? "Yes":"No"}
                </p>
              </div>
            </div>
            <div className="feature">
              <div className="iconWrapper">
                <FaBusAlt />
              </div>
              <div className="featureText">
                <span>Bus Stop</span>
                <p>
                  {post.postDetail.bus ? "Yes":"No"}
                </p>
              </div>
            </div>
            <div className="feature">
              <div className="iconWrapper">
                <FaUtensils />
              </div>
              <div className="featureText">
                <span>Restaurant</span>
                <p>
                  {post.postDetail.restaurant ? "Yes":"No"}
                </p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
           {currentUser?.id !== post.userId && <button onClick={initializeChat} className="messageBtn">
              <FaCommentDots />
              <span>Send a Message</span>
            </button>}
            <button
              onClick={handleSave}
              className={saved ? "savedBtn" : "saveBtn"}
            >
              {saved ? <FaBookmark /> : <FaRegBookmark />}
              <span>{saved ? "Place Saved" : "Save the Place"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message popup */}
      {showMessagePopup && (
        <div className="messagePopup">
          <div className="header">
            <h3>
              <span className="username">{chat?.receiver?.username}</span>
              <span className="aboutProperty">About: {post.title}</span>
            </h3>
            <button className="closeBtn" onClick={() => setShowMessagePopup(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="messages">
            {messages.length === 0 && (
              <div className="welcomeMessage">
                <FaStar className="icon" />
                <p>Start your conversation about "{post.title}"</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.userId === currentUser?.id ? 'own' : 'other'}`}
              >
                <div className="messageContent">{msg.text}</div>
                <div className="messageTime">{format(msg.createdAt)}</div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className="inputArea">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SinglePage;