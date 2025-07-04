import {Router} from 'express';
import {getFeedBack , postFeedBack , deleteFeedback} from  "../controller/feedbackController.js"

const router = Router();

router.get("/feedback", getFeedBack);
router.post("/feedback", postFeedBack);
router.get("/feedback/:id", deleteFeedback);

export default router;