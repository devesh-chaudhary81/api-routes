import {Router} from 'express';
import {getFeedBacks , postFeedBack , deleteFeedback} from  "../controller/feedbackController.js"

const router = Router();

router.get("/feedback", getFeedBacks);
router.post("/feedback", postFeedBack);
router.get("/feedback/:id", deleteFeedback);

export default router;