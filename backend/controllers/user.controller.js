import { UserModel } from "../models/user.model.js";
import { OtpModel } from "../models/otp.model.js";
import { SendOtpForEmailVerification } from "../utils/EmailVerification.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generateTokens.js";
import { generateUserCookies } from "../utils/generateCookies.js";
import { refreshAccessToken } from "../utils/refreshAccessToken.js";
import { UserRefreshTokenModel } from "../models/userRefreshToken.model.js";

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

    // if (
    //   existingUserInOtpDB &&
    //   !existingUser.is_verified &&
    //   existingUserInOtpDB.otp !== otp
    // ) {
    //   console.log("Inside");
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid otp",
    //   });
    // }

    // if (!existingUserInOtpDB) {
    // if (!existingUser.is_verified) {
    //   await SendOtpForEmailVerification(existingUser);
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid otp, new otp sent to your email",
    //   });
    // }
    // }

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
    return res.status(400).json({
      success: false,
      message: "Error while generating token, please try again ",
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
        $unwind: "$joinedData",
      },
      {
        $project: {
          "joinedData._id": 1,
          _id: 0,
        },
      },
    ]);
    return res.json({ userData });
  } catch (error) {
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

export {
  UserRegister,
  VerifyUserEmail,
  UserLogin,
  GetNewAccessToken,
  UserProfile,
  UserLogout,
  ChangeUserPassword,
};
