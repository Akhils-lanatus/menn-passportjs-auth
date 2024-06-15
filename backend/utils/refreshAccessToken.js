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
      throw new Error("Invalid token");
    }

    const tokenDetails = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN);

    const user = await UserModel.findById(tokenDetails._id);
    if (!user) {
      throw new Error("User not found");
    }

    const userRefreshTokenModelData = await UserRefreshTokenModel.findOne({
      userId: tokenDetails._id,
    });

    if (
      oldRefreshToken !== userRefreshTokenModelData.token ||
      userRefreshTokenModelData.blackListed
    ) {
      throw new Error("Unauthorized access");
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
    throw error;
  }
};
