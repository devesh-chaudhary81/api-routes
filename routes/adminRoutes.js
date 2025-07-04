import {Router} from "express"
import { viewUsers , viewBooks , viewStats , deleteBook , deleteUser} from '../controller/adminController.js' 

const router = Router()


router.get("/overview",viewStats)
router.get("/users",viewUsers)
router.get("/books",viewBooks)
router.delete("/books/:id",deleteBook)
router.delete("/users/:id",deleteUser)

export default router;