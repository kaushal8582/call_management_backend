import mongoose from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // No longer always required here; we'll handle it in hooks
    },
    role: {
      type: String,
      enum: ["worker", "admin"],
      default: "worker",
    },
    start_range: {
      type: Number,
      unique: true,
    },
    end_range: {
      type: Number,
      unique: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash the password if it is modified
workerSchema.pre("save", async function (next) {
  // Check if the password is modified or a new document
  if (!this.isModified("password")) return next();

  // Hash the password before saving
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Pre-validate hook to ensure password is required on creation
workerSchema.pre("validate", function (next) {
  if (this.isNew && !this.password) {
    this.invalidate("password", "Password is required");
  }
  next();
});

workerSchema.methods.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

workerSchema.methods.generateAccessToken = async function () {
  return JWT.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

workerSchema.methods.generateRefreshToken = async function () {
  return JWT.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Worker = mongoose.model("Worker", workerSchema);
