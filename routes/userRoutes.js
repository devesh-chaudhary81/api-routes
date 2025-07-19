import { Router } from "express";
import {registerUser, updateUser, login , logout} from "../controller/userController.js";
import { addToShelf, addToFavourites, getMyShelf, getFavourites } from '../controller/userController.js';

const router = Router();


router.post("/register", registerUser)
router.post("/login",login)
router.get("/logout",logout)
router.put("/:id", updateUser)




router.post('/shelf/add', addToShelf);
router.get('/shelf/:userId', getMyShelf);

router.post('/favourites/add', addToFavourites);
router.get('/favourites/:userId', getFavourites);

export default router;