import React, { useEffect, useState } from "react";
import "./profilePage.scss";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../lib/apiRequest";
import usePremiumModal from "../../store/usePremiumModal";
import { useUserSubscriptionLevel } from "../../context/SubscriptionContext";
import { canCreatePost } from "../../../utils";
import { FaPlus } from "react-icons/fa";
const PostButton = () => {
  const subLevel = useUserSubscriptionLevel();
  const [count, setCount] = useState();
  const [loading, setLoading] = useState(false);
  const {setOpenPremiumModal} = usePremiumModal()
  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get("/users/post-count");
        if (!res.data.success) {
          toast.error("Something went wrong");
        }
        setCount(res.data.data.totalCount);
      } catch (error) {
        toast.error("Couldnot get post count");
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []);
  if (loading) {
    return <div>loading..</div>;
  }
  const canCreate = canCreatePost(subLevel, count);

  return (
    <>
      {canCreate ? (
        <>
          <Link to="/add" className="createButton">
            <FaPlus /> Create New Post
          </Link>
        </>
      ) : (
        <>
         <button onClick={()=>setOpenPremiumModal(true)} className="createButton">
         <FaPlus /> Create New Post
         </button>
        </>
      )}
    </>
  );
};

export default PostButton;
