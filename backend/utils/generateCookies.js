const generateUserCookies = (
  res,
  accessToken,
  refreshToken,
  accessTokenExp,
  refreshTokenExp
) => {
  const accessTokenMaxAge =
    (accessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenMaxAge =
    (refreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: accessTokenMaxAge,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: refreshTokenMaxAge,
  });
  res.cookie("is_auth", 1, {
    httpOnly: false,
    secure: false,
    maxAge: refreshTokenMaxAge,
  });
};
export { generateUserCookies };
