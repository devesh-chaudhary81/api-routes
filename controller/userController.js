import user from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


//register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(404).json({
        message: "something is missing in your input",
        success: false,
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      name,
      email,
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

export const updateUser = async (req, res) => {
  const _id = req.params.id;
};

