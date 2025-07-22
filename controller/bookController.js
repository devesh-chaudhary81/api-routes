import book from "../model/book.js"

export const getBooks = async (req, res)=>{
    const books = await book.find()
    res.status(200).json(books)
}

export const getBookById = async (req, res) => {
  try {
    const getById = await book.findById(req.params.id);

    if (!getById) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json(getById);
  } catch (error) {
    res.status(500).json({ error: 'Invalid book ID or server error' });
  }
};

// export const AddBook = async (req, res)=>{
//     const newBook = new book(req.body);
//     await newBook.save()
//     res.status(201).json(newBook)
// }

export const AddBook = async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      // If multiple books are sent
      const newBooks = await book.insertMany(data);
      res.status(201).json({
        message: `${newBooks.length} books added successfully`,
        books: newBooks,
      });
    } else {
      // If single book is sent
      const newBook = new book(data);
      await newBook.save();
      res.status(201).json({
        message: 'Book added successfully',
        book: newBook,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateBook = async(req, res)=>{
    const updateBook = await book.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.status(200).json(updateBook)
}

export const deleteBook = async(req, res)=>{
    const deleteBook = await book.findByIdAndDelete(req.params.id)
    res.status(200).json(deleteBook)
}

