import jwt from "jsonwebtoken";
import { UserRefreshTokenModel } from "../models/userRefreshToken.model.js";
import { UserModel } from "../models/user.model.js";
import { generateTokens } from "./generateTokens.js";
export const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    const userUserRefreshToken = await UserRefreshTokenModel.findOne({
      token: oldRefreshToken,
    });

    if (!userUserRefreshToken) {
      return res.status(400).json({
        success: true,
        message: "Invalid token",
      });
    }

    const tokenDetails = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN);

    const user = await UserModel.findById(tokenDetails._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const userRefreshTokenModelData = await UserRefreshTokenModel.findOne({
      userId: tokenDetails._id,
    });

    if (
      oldRefreshToken !== userRefreshTokenModelData.token ||
      userRefreshTokenModelData.blackListed
    ) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      await generateTokens(user);
    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    };
  } catch (error) {
    console.log(`Error in token::${error}`);
  }
};
