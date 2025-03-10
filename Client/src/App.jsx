import Homepage from "./Pages/homepage/homepage"
import{
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Layout, RequireAuth }  from "./Pages/layout/layout";
import SinglePage from "./Pages/SinglePage/SinglePage";
import ListPage from "./Pages/homepage/listpage/listpage";
import ProfilePage from "./Pages/profilePage/profilePage";
import ProfileUpdatePage from "./Pages/profileUpdatePage/profileUpdatePage"
import Register from "./Pages/register/register";
import Login from "./Pages/login/login";
import NewPostPage from "./Pages/newPostPage/newPostPage"
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";
import About from "./Pages/About/About";
import Contact from "./Pages/contact/Contact";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
       children: [
        {
          path: "/",
          element: <Homepage/>,
        },
        {
          path: "/list",
          element: <ListPage/>,
          loader: listPageLoader,
        },
        {
          path: "/:id",
          element: <SinglePage/>,
          loader: singlePageLoader,
        },
      
        {
          path: "/register",
          element: <Register/>,
        },
        {
          path: "/login",
          element: <Login/>,
        },
        {
          path: "/About",
          element: <About/>,
        },
        {
          path: "/Contact",
          element: <Contact/>,
        },
        
       
       

       ]
      
    },
    {
      path: "/",
      element:< RequireAuth />,
      children:[
        {
          path: "/profile",
          element: <ProfilePage/>,
          loader: profilePageLoader
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage/>,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
      ],
    },

  ]);

  return <RouterProvider router={router} />;
}

export default App;