import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaUserEdit, FaSignOutAlt, FaPlus, FaBookmark, FaHome, FaCreditCard } from "react-icons/fa";
import { useUserSubscriptionLevel } from "../../context/SubscriptionContext";
import PostButton from "./PostButton";

function ProfilePage() {
  const data = useLoaderData();
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest.put("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="profileHeader">
            <div className="profileInfo">
              <div 
                className="avatarContainer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <img src={currentUser.avatar || "noavatar.jpg"} alt="Profile" />
                <div className={`avatarOverlay ${isHovered ? 'active' : ''}`}>
                  <Link to="/profile/update">
                    <FaUserEdit className="editIcon" />
                  </Link>
                </div>
              </div>
              <div className="userDetails">
                <h2>{currentUser.username}</h2>
                <p>{currentUser.email}</p>
              </div>
            </div>
            <div className="profileActions buttons-container">
              <Link to="/billing" className="billingButton">
                <FaCreditCard /> Billing
              </Link>
              <button className="logoutButton" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          <div className="contentSection">
            <div className="sectionHeader">
              <div className="sectionTitle">
                <FaHome className="sectionIcon" />
                <h1>My Posts</h1>
              </div>
            <PostButton/>
            </div>
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <Await
                resolve={data.postResponse}
                errorElement={<div className="error">Error loading posts!</div>}
              >
                {(postResponse) => <List posts={postResponse.data.userPosts} />}
              </Await>
            </Suspense>
          </div>

          <div className="contentSection">
            <div className="sectionHeader">
              <div className="sectionTitle">
                <FaBookmark className="sectionIcon" />
                <h1>Saved Posts</h1>
              </div>
            </div>
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <Await
                resolve={data.postResponse}
                errorElement={<div className="error">Error loading posts!</div>}
              >
                {(postResponse) => <List posts={postResponse.data.savedPosts} />}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>

      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Await
              resolve={data.chatResponse}
              errorElement={<div className="error">Error loading chats!</div>}
            >
              {(chatResponse) => <Chat chats={chatResponse.data} />}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;