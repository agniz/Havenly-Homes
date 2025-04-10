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

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
              </div>
              <div className="user">
                <img src={post.user.avatar} alt="" />
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
              <img src="/utility.png" alt="" />
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
              <img src="/pet.png" alt="" />
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
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school ? "Yes":"No"}
                 
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>
                  {post.postDetail.bus ? "Yes":"No"}
                 
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
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
           {currentUser.id !== post.userId && <button onClick={initializeChat}>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>}
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? "#fece51" : "white",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Place Saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
      <>
        {/* Message Popup */}
        {showMessagePopup && chat && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            width: "90%",
            maxWidth: "500px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid #eaeaea",
              backgroundColor: "#f8f8f8",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <img 
                  src={chat.receiver.avatar || "/noavatar.jpg"} 
                  alt="" 
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "600",
                  }}>{chat.receiver.username}</h3>
                  <p style={{
                    margin: "2px 0 0 0",
                    fontSize: "12px",
                    color: "#65676B",
                  }}>About: {post.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMessagePopup(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#606770",
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Message area */}
            <div style={{
              padding: "16px",
              height: "250px",
              overflowY: "auto",
              backgroundColor: "#f0f2f5",
              display: "flex",
              flexDirection: "column",
            }}>
              {messages.length === 0 && (
                <div style={{
                  margin: "0 auto",
                  padding: "8px 12px",
                  backgroundColor: "#E4E6EB",
                  borderRadius: "18px",
                  fontSize: "13px",
                  color: "#65676B",
                  textAlign: "center",
                  maxWidth: "80%",
                }}>
                  This is the beginning of your conversation about "{post.title}"
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.userId === currentUser.id ? "flex-end" : "flex-start",
                    textAlign: msg.userId === currentUser.id ? "right" : "left",
                    margin: "4px 0",
                  }}
                >
                  <div style={{
                    backgroundColor: msg.userId === currentUser.id ? "#0084ff" : "#e4e6eb",
                    color: msg.userId === currentUser.id ? "white" : "black",
                    borderRadius: "18px",
                    padding: "8px 12px",
                    maxWidth: "70%",
                    wordBreak: "break-word",
                    display: "inline-block",
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: "#65676B",
                    marginTop: "2px",
                  }}>
                    {format(msg.createdAt)}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef}></div>
            </div>
            
            {/* Input area */}
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              borderTop: "1px solid #eaeaea",
              backgroundColor: "#fff",
            }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message about ${post.title}...`}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: "20px",
                  padding: "10px 14px",
                  resize: "none",
                  height: "40px",
                  backgroundColor: "#f0f2f5",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#0084ff",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      
    
    </div>
  );
}

export default SinglePage;