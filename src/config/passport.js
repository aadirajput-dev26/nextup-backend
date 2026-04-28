import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import Organisation from "../models/organisation.model.js";

// Helper – find or create a User + profile shell for OAuth providers
const findOrCreate = async ({ email, provider, providerId, role }) => {
  // 1. Try existing user by email
  let user = await User.findOne({ email });

  if (user) return user; // existing account → ignore provider role

  // 2. Create role-specific profile shell (all optional fields left empty)
  let profile;
  if (role === "organisation") {
    profile = await Organisation.create({ email });
  } else {
    profile = await Student.create({ email });
  }

  // 3. Create auth user document
  user = await User.create({
    email,
    provider,
    providerId,
    role,
    profileRef: profile._id,
    profileModel: role === "organisation" ? "Organisation" : "Student",
  });

  return user;
};

// Google OAuth 2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true, // so we can read req.query.state
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Role is forwarded in the OAuth state param
        const role = req.query.state || "student";
        const email = profile.emails?.[0]?.value;

        if (!email) return done(new Error("No email from Google"), null);

        const user = await findOrCreate({
          email,
          provider: "google",
          providerId: profile.id,
          role,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// GitHub OAuth 2.0 Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      scope: ["user:email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.query.state || "student";
        const email =
          profile.emails?.[0]?.value ||
          `${profile.username}@github.noemail.local`;

        const user = await findOrCreate({
          email,
          provider: "github",
          providerId: String(profile.id),
          role,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Passport session stubs – we use stateless JWT, not sessions
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
