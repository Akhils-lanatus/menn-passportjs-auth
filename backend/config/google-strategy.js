import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { UserModel } from "../models/user.model.js";
import { generateTokens } from "../utils/generateTokens.js";
import bcrypt from "bcrypt";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      //   console.log("Profile", profile);
      try {
        let user = await UserModel.findOne({ email: profile._json.email });
        if (!user) {
          const lastSixDigitsID = profile.id.substring(profile.id.length - 6);
          const lastTwoDigitsName = profile._json.name.substring(
            profile._json.name.length - 2
          );
          const newPass = lastTwoDigitsName + lastSixDigitsID;
          const salt = await bcrypt.genSalt(Number(process.env.SALT));
          const hashedPassword = await bcrypt.hash(newPass, salt);
          user = await UserModel.create({
            name: profile._json.name,
            email: profile._json.email,
            is_verified: true,
            password: hashedPassword,
            avatar: profile._json.picture,
          });
        }
        const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
          await generateTokens({}, user);
        return done(null, {
          user,
          accessToken,
          refreshToken,
          accessTokenExp,
          refreshTokenExp,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);
