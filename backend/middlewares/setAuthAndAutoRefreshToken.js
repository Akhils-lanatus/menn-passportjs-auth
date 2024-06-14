import { generateUserCookies } from "../utils/generateCookies.js";
import { isTokenExpired } from "../utils/isTokenExpired.js";
import { refreshAccessToken } from "../utils/refreshAccessToken.js";

export const accessTokenAutoRefresh = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (accessToken || !isTokenExpired(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }

    if (!accessToken || isTokenExpired(accessToken)) {
      const refToken = req.cookies.refreshToken;
      if (!refToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is missing",
        });
      }
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
        await refreshAccessToken(req, res);
      generateUserCookies(
        res,
        accessToken,
        refreshToken,
        accessTokenExp,
        refreshTokenExp
      );
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Access token is missing or is invalid",
    });
  }
};
