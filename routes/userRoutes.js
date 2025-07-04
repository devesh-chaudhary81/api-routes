import { Router } from "express";
import {registerUser, updateUser, login , logout} from "../controller/userController.js";

const router = Router();


router.post("/register", registerUser)
router.post("/login",login)
router.get("/logout",logout)
router.put("/:id", updateUser)


export default router;