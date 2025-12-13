//passport:
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

 passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:");
        const email = profile.emails?.[0]?.value;

        let usuario = await User.findOne({ where: { email } });

        if (!usuario) {
          usuario = await User.create({
            nombre: profile.displayName,
            email,
            googleId: profile.id,
          });
          console.log("✅ Nuevo usuario creado:", usuario.email);
        } else if (!usuario.googleId) {
          usuario.googleId = profile.id;
          await usuario.save();
        }

        const tokenDuracion = 60;
        const expiracion = new Date();
        expiracion.setMinutes(expiracion.getMinutes() + tokenDuracion);

        const token = jwt.sign(
          { id: usuario.id, email: usuario.email },
          process.env.JWT_SECRET,
          { expiresIn: `1h`}
        //   { expiresIn: `${tokenDuracion}m `}
        );

        await usuario.update({ token, tokenExpiracion: expiracion });

        return done(null, { ...usuario.toJSON(), token });
      } catch (error) {
        console.log("Error al autenticar con Google:", error);
        
        return done(error, undefined);
      }
    }
  )
);
