const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../config/mailer');

const ALLOWED_ROLES = ['company_admin', 'company_secretary'];

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    if (!email || !password || !captcha) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and captcha are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only company admin and company secretary can login',
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    try {
      await sendOtpEmail({ to: user.email, otp });
    } catch (mailError) {
      console.error('OTP email sending failed:', {
        message: mailError.message,
        code: mailError.code,
        response: mailError.response,
        responseCode: mailError.responseCode,
      });

      user.otp = null;
      user.otpExpire = null;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check SMTP configuration.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and otp are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (!user.otpExpire || user.otpExpire.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
    }
    if (!ALLOWED_ROLES.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only company admin and company secretary can login',
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'company-umbrella-jwt-secret',
      { expiresIn: '1d' }
    );

    user.otp = null;
    user.otpExpire = null;
    await user.save();

    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.email.split('@')[0],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  verifyOtp,
};
