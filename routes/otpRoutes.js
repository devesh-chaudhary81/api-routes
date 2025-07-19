import express from 'express';
import { sendOtp, verifyOtp, resetPassword } from '../controller/otpController.js';
const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;

