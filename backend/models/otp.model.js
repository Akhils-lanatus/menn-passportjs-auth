import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900,
    },
  },
  { timestamps: true }
);

export const OtpModel = mongoose.model("otp", OtpSchema);
