import feedback from "../model/feedback.js"

export const postFeedBack = async (req,res) =>{
    const postfeedback = new feedback(req.body);
        await postfeedback.save()
        res.status(201).json(postfeedback)
}

export const getFeedBacks = async (req, res) => {
  const { userId } = req.query;

  try {
    let feedbacks;
    if (userId) {
      feedbacks = await feedback.find({ userId });
    } else {
      feedbacks = await feedback.find();
    }

    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
};

export const deleteFeedback = async (req,res) =>{
    const deleteFeedback = await feedback.findByIdAndDelete(req.params.id)
        res.status(200).json(deleteFeedback)
}

