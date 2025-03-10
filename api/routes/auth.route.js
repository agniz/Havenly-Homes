import express from "express";
import { logout, register ,login} from "../controllers/auth.controller.js";

const router = express.Router()

router.post("/register", register);
router.post("/login", login);
router.put("/logout", logout);



export default router;

