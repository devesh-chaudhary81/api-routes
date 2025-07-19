import nodemailer from 'nodemailer';
import User from '../model/user.js';
import bcrypt from "bcrypt"; 

let otpStore = {}; // { email: { otp, expiresAt } }

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 mins

  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  await transporter.sendMail({
    from: `"Virtual Library" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for password reset',
    html: `<p>Your OTP is: <b>${otp}</b></p>`,
  });

  res.json({ message: 'OTP sent successfully' });
};

export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record || record.otp != otp || record.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  res.json({ message: 'OTP verified successfully' });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword; // If using bcrypt, hash it here
  await user.save();

  delete otpStore[email]; // Clear OTP after use
  res.json({ message: 'Password reset successfully' });
};


