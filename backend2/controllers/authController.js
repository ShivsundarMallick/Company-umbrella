const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../config/mailer');

const ALLOWED_ROLES = ['company_admin', 'company_secretary'];
const AUTH_DEBUG = process.env.AUTH_DEBUG === 'true';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const normalizeEmail = (email = '') =>
  String(email).toLowerCase().trim().replace(/[;,]+$/g, '');
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BCRYPT_HASH_PREFIX = /^\$2[aby]\$\d{2}\$/;

const getEmailQuery = (normalizedEmail) => ({
  email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' },
});

const findUserForLogin = async (normalizedEmail, password) => {
  const candidates = await User.find(getEmailQuery(normalizedEmail)).sort({ createdAt: -1 });
  if (AUTH_DEBUG) {
    console.log('[auth][login] candidates', { email: normalizedEmail, count: candidates.length });
  }
  if (!candidates.length) return null;

  for (const candidate of candidates) {
    const storedPassword = candidate.password || '';
    if (!BCRYPT_HASH_PREFIX.test(storedPassword)) {
      continue;
    }

    console.log('[auth][debug] Comparing password payload:', password, 'with hash:', storedPassword);
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    console.log('[auth][debug] isPasswordValid:', isPasswordValid);
    if (isPasswordValid) {
      if (AUTH_DEBUG) {
        console.log('[auth][login] matched user', { email: normalizedEmail, userId: String(candidate._id) });
      }
      return candidate;
    }
  }

  return null;
};

const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    if (!email || !password || !captcha) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and captcha are required',
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await findUserForLogin(normalizedEmail, password);

    if (!user) {
      if (AUTH_DEBUG) {
        console.log('[auth][login] invalid credentials', { email: normalizedEmail });
      }
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

    const normalizedEmail = normalizeEmail(email);
    let user = await User.findOne({
      ...getEmailQuery(normalizedEmail),
      otp,
    }).sort({ updatedAt: -1 });
    if (!user) {
      user = await User.findOne(getEmailQuery(normalizedEmail)).sort({ updatedAt: -1 });
    }
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
