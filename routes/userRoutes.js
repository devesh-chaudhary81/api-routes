import { Router } from "express";
import {registerUser, updateUser, login , logout} from "../controller/userController.js";
import { addToShelf, addToFavourites, getMyShelf, getFavourites,getReadingTime,getUserStats,removeFavourites,removeFromMyShelf } from '../controller/userController.js';
import User from '../model/user.js';
import book from '../model/book.js';
const router = Router();


router.post("/register", registerUser)
router.post("/login",login)
router.get("/logout",logout)
router.put("/:id", updateUser)




router.post('/shelf/add', addToShelf);
router.get('/shelf/:userId', getMyShelf);
router.delete('/favourites/:userId/:bookId', removeFavourites);


router.post('/favourites/add', addToFavourites);
router.get('/favourites/:userId', getFavourites);
router.delete('/shelf/:userId/:bookId', removeFromMyShelf);



router.get("/reading-time/:userId", getReadingTime);
// router.get("/stats/:userId", getUserStats);

router.get('/last5-read/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('bookViews.bookId');

    if (!user || !user.bookViews.length) {
      return res.status(404).json({ error: "User not found or no views" });
    }

    // Last 5 distinct books
    const seen = new Set();
    const last5 = user.bookViews.filter(view => {
      const id = view.bookId._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 5);

    const result = last5.map(view => ({
      title: view.bookId.title,
      timeSpent: view.timeSpent || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching last 5 read books:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stats/:userId",async(req,res)=>{
     const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) return res.status(404).send("User not found");

  res.json({
    shelfCount: user.myShelf.length,
    favouriteCount: user.favourites.length
  });
})


export default router;