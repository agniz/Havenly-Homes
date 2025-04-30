import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Homepage from "./Pages/homepage/homepage";
import { Layout, RequireAuth } from "./Pages/layout/layout";
import SinglePage from "./Pages/SinglePage/SinglePage";
import ListPage from "./Pages/homepage/listpage/listpage";
import ProfilePage from "./Pages/profilePage/profilePage";
import ProfileUpdatePage from "./Pages/profileUpdatePage/profileUpdatePage";
import Register from "./Pages/register/register";
import Login from "./Pages/login/login";
import NewPostPage from "./Pages/newPostPage/newPostPage";
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";
import AdminDashboard from "./admin/AdminDashboard";
import ManageUsers from "./admin/ManageUsers";
import ManageListings from "./admin/ManageListing";
import { ToastContainer } from "react-toastify";
import ViewListing from "./admin/ViewListing";
import Billing from "./Pages/billing/Billing";
import Success from "./Pages/billing/Success";
import UserSubscriptionLevelProvider from "./context/SubscriptionContext";
import apiRequest from "./lib/apiRequest";
import SubscriptionModal from "./components/SubscriptionModal";

// ✅ Admin Route Wrapper Component
function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.isAdmin ? children : <Navigate to="/" />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/billing", element: <Billing /> },
      { path: "/billing/success", element: <Success /> },
      { path: "/list", element: <ListPage />, loader: listPageLoader },
      { path: "/:id", element: <SinglePage />, loader: singlePageLoader },
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      
    ],
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      { path: "/profile", element: <ProfilePage />, loader: profilePageLoader },
      { path: "/profile/update", element: <ProfileUpdatePage /> },
      { path: "/add", element: <NewPostPage /> },
    ],
  },
  // ✅ Admin Routes wrapped inside `AdminRoute`
  {
    path: "/admin",
    element: <AdminRoute><AdminDashboard /></AdminRoute>,
  },
  {
    path: "/admin/users",
    element: <AdminRoute><ManageUsers /></AdminRoute>,
  },
  {
    path: "/admin/listings",
    element: <AdminRoute><ManageListings /></AdminRoute>,
  },
  {
    path: "/admin/listing/:id",
    element: <AdminRoute><ViewListing /></AdminRoute>,
  }
]);


function App() {

  const [userSubscriptionLevel,setUserSubscriptionLevel] = useState(null)
  const [loading,setLoading] = useState(false)
  
  useEffect(() => {
    const fetchUserSubscriptionLevel = async () => {
      try {
        setLoading(true)
        const userSubRes = await apiRequest.get("/users/sub-level");
        if(!userSubRes){
          throw new Error('Invalid Sub')
        }
        if(!userSubRes.data.success){
          throw new Error('Error in Req')
        }  
        setUserSubscriptionLevel(userSubRes.data.data.type)
    } catch (err) {
      throw new Error('Error in Req')
   }finally{
        setLoading(false)
      }
    };

    fetchUserSubscriptionLevel();
  }, []);

  if(loading){
    return <div>Loading....</div>
  }

  return <div style={{position:'relative'}}>
  <UserSubscriptionLevelProvider userSubscriptionLevel={userSubscriptionLevel}>
  <ToastContainer/>
  <RouterProvider router={router} />;
  <SubscriptionModal currentPlan={userSubscriptionLevel}/>
  </UserSubscriptionLevelProvider>

  </div>
}


export default App;
