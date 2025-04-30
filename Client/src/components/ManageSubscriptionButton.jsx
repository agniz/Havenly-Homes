import React from "react";
import apiRequest from "../lib/apiRequest";

const ManageSubscriptionButton = () => {
  const handleClick = async () => {
    try {
      const res = await apiRequest.post("/stripe/create-portal");
      if (res.data.success) {
        window.location.href = res.data.data.url;
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {}
  };
  return (
    <button
      onClick={async()=>await handleClick()}
      style={{
        padding: "10px 20px",
        borderRadius: 4,
        backgroundColor: "red",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      Manage Subscription
    </button>
  );
};

export default ManageSubscriptionButton;
