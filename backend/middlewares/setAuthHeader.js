import { isTokenExpired } from "../utils/isTokenExpired.js";
export const setAuthHeader = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (accessToken || !isTokenExpired(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }
    next();
  } catch (error) {
    console.log(`Error adding token to header :: ${error}`);
  }
};
