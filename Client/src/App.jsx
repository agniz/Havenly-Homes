import React from "react";
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
import Footer from "./components/Footer/Footer";

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
  return <>
  <ToastContainer/>
  <RouterProvider router={router} />;

  </>
}


export default App;
