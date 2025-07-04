import feedback from "../model/feedback.js"

export const postFeedBack = async (req,res) =>{
    const postfeedback = new feedback(req.body);
        await postfeedback.save()
        res.status(201).json(postfeedback)
}

export const getFeedBack = async (req,res) =>{
    const feedbacks = await feedback.find()
    res.status(200).json(feedbacks)
}

export const deleteFeedback = async (req,res) =>{
    const deleteFeedback = await feedback.findByIdAndDelete(req.params.id)
        res.status(200).json(deleteFeedback)
}