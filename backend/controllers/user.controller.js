import { UserModel } from "../models/user.model.js";
import { OtpModel } from "../models/otp.model.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
const UserRegister = async (req, res) => {
  try {
    const { name, email, password, confirm_password } = req.body;
    if (!name || !email || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password?.trim() !== confirm_password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password didn't match",
      });
    }

    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    if (!hashedPass) {
      return res.status(400).json({
        success: false,
        message: "Error in hashing pass",
      });
    }
    const user = await UserModel.create({
      name,
      email,
      password: hashedPass,
    });

    const createdUser = await UserModel.findOne(
      { _id: user._id },
      { password: 0 }
    );

    SendOtpForEmailVerification(createdUser);

    if (!createdUser) {
      return res
        .status(500)
        .json({ success: false, message: "User registration failed" });
    }

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: createdUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to register,please try again later",
      error: `Registration Error :: ${error}`, //only for testing, remove later
    });
  }
};

const SendOtpForEmailVerification = async (user) => {
  console.log(user);
  const GeneratedOtp = Math.floor(1000 + Math.random() * 9000);
  await OtpModel.updateOne(
    { userId: user._id },
    { $set: { otp: GeneratedOtp, createdAt: new Date() } },
    { upsert: true }
  );

  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .header {
            text-align: center;
            background-color: #007bff;
            color: #ffffff;
            padding: 10px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .otp {
            font-size: 20px;
            font-weight: bold;
            color: #007bff;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            padding: 10px;
            border-top: 1px solid #e0e0e0;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>OTP Verification</h2>
        </div>
        <div class="content">
            <p>Dear User,</p>
            <p>Thank you for using our service. Please use the following One-Time Password (OTP) to complete your verification process:</p>
            <div class="otp">${GeneratedOtp}</div>
            <p>This OTP is valid for 1 minutes. Do not share this OTP with anyone.</p>
            <p>Best regards,</p>
            <p>Your Company</p>
        </div>
        <div class="footer">
            <p>If you did not request this OTP, please ignore this email or contact support.</p>
        </div>
    </div>
</body>
</html>
    `;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.sendMail(
    {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your OTP Verification Code",
      html: htmlContent,
    },
    (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log("Message sent: %s", info);
    }
  );
};

export { UserRegister };
