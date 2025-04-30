import express from "express";
import cors from "cors";
import dotenv from "dotenv";  
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import adminRoutes from "./routes/admin.route.js";
import stripeRoutes from "./routes/stripe.route.js";
import webhookRoute from "./routes/webhook.route.js";

// Load environment variables
dotenv.config();  
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);
app.use('/api/webhook', webhookRoute);


app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/admin", adminRoutes);
app.use('/api/stripe',stripeRoutes)

app.listen(3000, () => console.log("Server running on port 3000"));
