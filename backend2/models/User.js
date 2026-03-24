const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["company_admin", "company_secretary"],
      required: true
    },
    otp: {
      type: String,
      default: null
    },
    otpExpire: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = UserSchema;
