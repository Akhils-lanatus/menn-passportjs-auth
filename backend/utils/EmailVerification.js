import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import { OtpModel } from "../models/otp.model.js";
const SendOtpForEmailVerification = async (user) => {
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
            <p>This OTP is valid for 5 minutes. Do not share this OTP with anyone.</p>
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
      } else {
        if (info.response.includes("OK")) {
          console.log(`Otp sent :: ${info}`);
        }
      }
    }
  );
};

export { SendOtpForEmailVerification };
