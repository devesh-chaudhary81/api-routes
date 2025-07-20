import user from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from '../model/user.js';
import book from '../model/book.js';


//register
export const registerUser = async (req, res) => {
  try {
    const { name, email,username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(404).json({
        message: "something is missing in your input",
        success: false,
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      name,
      email,
      username,
      password: hashPassword,
    });
    await newUser.save();
    // res.send("<h1>registered</h1>");
    res.status(200).json({
        message:"user registered successfully",
        data:newUser
    })
  } catch (err) {
    return res.status(500).json({
      message: "Registration failer",
      error: err,
    });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "something is missing",
        success: false,
      });
    }
    const User = await user.findOne({email});
    if (!User) {
    //   res.redirect("/signup");
      return res.status(400).json({
        message: "Register first",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, User.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const tokendata = {
      userId: User._id,
      name: User.name,
      email:User.email
    };
     console.log(User);
    const token = await jwt.sign(tokendata, process.env.SECRET_KEY, {
      expiresIn: "1h"
    });
    const cookieoptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    };
    return res
      .status(200)
      .cookie("login", token , cookieoptions)
      .json({
        message: `Welcome back ${User.name}`,
        user: {
          _id: User.id,
          name: User.name,
          email: User.email,
        },
        success: true,
      });
  } catch (err) {
    return res.status(500).json({
      message: "internal server error",
      error: err,
    });
  }
};


//logut
export const logout = async (req, res)=> {
    try {
        res.clearCookie("login"); // Clear the login cookie
        return res.status(200).json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
});
}
};





// 📌 Add a book to MyShelf
export const addToShelf = async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const alreadyAdded = user.myShelf.find(item => item.bookId.toString() === bookId);

    if (!alreadyAdded) {
      user.myShelf.push({ bookId, lastPageRead: 0 });
      await user.save();
    }

    res.json({ message: 'Book added to MyShelf' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to MyShelf' });
  }
};

export const addToFavourites = async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.favourites.includes(bookId)) {
      user.favourites.push(bookId);
      await user.save();
    }

    res.status(200).json({ message: 'Book added to favourites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 📌 Get books in MyShelf
export const getMyShelf = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate('myShelf.bookId');

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.myShelf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get MyShelf books' });
  }
};




// 📌 Get Favourite Books
export const getFavourites = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate('favourites');

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.favourites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get favourite books' });
  }
};


export const updateUser = async (req, res) => {
  const _id = req.params.id;
};


export const getReadingTime = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const hours = (user.totalReadingTime || 0) / 60;
    res.json({ hours: hours.toFixed(2) });
  } catch (error) {
    console.error("Reading time error:", error);
    res.status(500).json({ error: "Failed to fetch reading time" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("bookViews.bookId");
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const filteredViews = user.bookViews.filter(
      (view) => new Date(view.viewedAt) >= lastMonth
    );

    const totalMinutes = user.totalReadingTime || 0;

    res.json({
      hoursLastMonth: (totalMinutes / 60).toFixed(2),
      booksViewed: filteredViews.length,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

