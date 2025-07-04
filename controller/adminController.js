import admin from "../model/admin.js"
import book from "../model/book.js"
import user from "../model/user.js"

export const viewStats = async (req, res)=>{
    await 
    res.status(200).send("<h1> here are the stats</h1>")
}


export const viewUsers = async (req, res)=>{
    const allUsers = await user.find()
    res.status(201).json(allUsers)
}

export const viewBooks = async (req, res)=>{
    const allBooks = await book.find()
    res.status(201).json(allBooks)
}

export const deleteBook = async(req, res)=>{
    const deleteBook = await book.findByIdAndDelete(req.params.id)
    res.status(200).json(deleteBook)
}

export const deleteUser = async (req, res)=>{
    const deleteUser = await book.findByIdAndDelete(req.params.id)
    res.status(200).json(deleteUser)
}