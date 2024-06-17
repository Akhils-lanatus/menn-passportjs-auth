import jwt from "jsonwebtoken";
import { UserRefreshTokenModel } from "../models/userRefreshToken.model.js";
const generateTokens = async (req, user) => {
  try {
    const payload = { _id: user._id, roles: user.roles };
    const accessTokenExp = Math.floor(Date.now() / 1000) + 100;
    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5;

    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },
      process.env.REFRESH_TOKEN
    );
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },
      process.env.ACCESS_TOKEN
    );

    await UserRefreshTokenModel.findOneAndUpdate(
      {
        userId: user._id,
      },
      { token: req.cookies.refreshToken || refreshToken },
      { upsert: true }
    );

    return {
      accessToken,
      refreshToken: req.cookies.refreshToken || refreshToken,
      accessTokenExp,
      refreshTokenExp,
    };
  } catch (error) {
    console.log(`Generating token error :: ${error}`);
  }
};

export { generateTokens };
