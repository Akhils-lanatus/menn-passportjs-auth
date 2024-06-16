import { UserModel } from "../models/user.model.js";
import { OtpModel } from "../models/otp.model.js";
import { SendOtpForEmailVerification } from "../utils/EmailVerification.js";
import { generateTokens } from "../utils/generateTokens.js";
import { generateUserCookies } from "../utils/generateCookies.js";
import { refreshAccessToken } from "../utils/refreshAccessToken.js";
import { UserRefreshTokenModel } from "../models/userRefreshToken.model.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
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

    await SendOtpForEmailVerification(createdUser);

    if (!createdUser) {
      return res
        .status(500)
        .json({ success: false, message: "User registration failed" });
    }

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully, OTP Sent to email to verify",
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

const VerifyUserEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "No such email found",
      });
    }

    if (existingUser.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Already verified",
      });
    }
    const existingUserInOtpDB = await OtpModel.findOne({
      userId: existingUser._id,
    });

    if (!existingUserInOtpDB) {
      if (!existingUser.is_verified) {
        await SendOtpForEmailVerification(existingUser);
        return res.status(400).json({
          success: false,
          message: "Invalid otp, new otp sent to your email",
        });
      }
    } else {
      if (!existingUser.is_verified) {
        if (existingUserInOtpDB.otp !== otp) {
          return res.status(400).json({
            success: false,
            message: "Invalid OTP",
          });
        }
      }
    }

    const currentTime = new Date();
    const otpExpirationTime = new Date(
      existingUserInOtpDB.createdAt.getTime() + 15 * 60 * 1000
    );

    if (currentTime > otpExpirationTime) {
      await SendOtpForEmailVerification(existingUser);
      return res.status(400).json({
        success: false,
        message: "OTP Expired, new otp sent to your email",
      });
    }

    await UserModel.findByIdAndUpdate(existingUser._id, {
      $set: { is_verified: true },
    });
    await OtpModel.deleteMany({ userId: existingUser._id });
    return res.status(200).json({
      success: true,
      message: "Email Verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error in verifying otp, please try again",
    });
  }
};

const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "No such email found",
      });
    }

    if (!existingUser.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Your account is not verified",
      });
    }

    const comparePassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      await generateTokens(existingUser);
    generateUserCookies(
      res,
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user: {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
      },
      roles: existingUser.roles,
      accessToken,
      refreshToken,
      accessTokenExp,
      is_auth: true,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error while logging , please try again ",
    });
  }
};

const GetNewAccessToken = async (req, res) => {
  try {
    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      await refreshAccessToken(req, res);
    generateUserCookies(
      res,
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    );

    res.status(200).json({
      success: true,
      message: "New tokens generated",
      accessToken,
      refreshToken,
      accessTokenExp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.message || "Error while generating token, please try again ",
    });
  }
};

const UserProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

const ChangeUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirm_password } = req.body;
    if (!oldPassword || !newPassword || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const token = req.cookies.refreshToken;
    const userData = await UserRefreshTokenModel.aggregate([
      { $match: { token } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "joinedData",
        },
      },
      {
        $addFields: {
          joinedData: { $arrayElemAt: ["$joinedData", 0] },
        },
      },
      {
        $project: {
          user_id: "$joinedData._id",
          user_pass: "$joinedData.password",
          _id: 0,
        },
      },
    ]);

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "Invalid entry ",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      userData[0].user_pass
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (newPassword.trim() !== confirm_password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password didn't match",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(newPassword, salt);
    await UserModel.findByIdAndUpdate(
      userData[0].user_id,
      {
        $set: { password: hashedPass },
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Unable to change password, please try again",
    });
  }
};

const UserLogout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("is_auth");

    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Unable to logout, please try again",
    });
  }
};

const SendUserPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email " });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No such email found",
      });
    }
    const secret = user._id + process.env.ACCESS_TOKEN;
    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: "15m",
    });

    const resetPassLink = `${process.env.FRONTEND_HOST}/account/reset-password/${user._id}/${token}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Email</title>
    <style>
        /* Reset styles */
        body, html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f5f5f5;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333;
        }
        p {
            margin-bottom: 20px;
            color: #666;
        }
        .reset-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetPassLink}" class="reset-link">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
</body>
</html>
`;

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_HOST,
      secure: true,
      port: process.env.EMAIL_PORT,
      tls: {
        rejectUnauthorized: true,
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    transporter.sendMail(
      {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Reset Password",
        html: htmlContent,
      },
      (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log(info);
          if (info.response.includes("OK")) {
            console.log(`Link sent`);
          }
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
      resetPassLink,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to send link, please try again",
    });
  }
};

const ResetUserPassword = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    const { id, token } = req.params;
    if (!password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No such user found",
      });
    }

    const secret = user._id + process.env.ACCESS_TOKEN;
    jwt.verify(token, secret);

    if (password.trim() !== confirm_password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password didn't match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    user.password = hashedPass;
    user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfull",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token Expired"
          : "Unable to reset password, please try again",
    });
  }
};

export {
  UserRegister,
  VerifyUserEmail,
  UserLogin,
  GetNewAccessToken,
  UserProfile,
  UserLogout,
  ChangeUserPassword,
  SendUserPasswordResetEmail,
  ResetUserPassword,
};
