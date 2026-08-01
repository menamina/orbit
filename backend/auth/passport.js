import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "../prisma/client.js";

// GitHub OAuth Strategy (STATELESS - no sessions, will return JWT)
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // `profile` comes from GitHub API response, contains:
      // - profile.id: GitHub user ID (e.g., "12345678")
      // - profile.username: GitHub username
      // - profile.displayName: Full name from GitHub
      // - profile.emails: Array of email objects
      // - profile.photos: Avatar URLs

      try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: {
            provider_providerId: {
              provider: "github",
              providerId: profile.id,
            },
          },
        });

        if (user) {
          // User exists, return it
          return done(null, user);
        }

        // User doesn't exist, create new user
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        const name = profile.displayName || profile.username;
        const username = profile.username;

        user = await prisma.user.create({
          data: {
            name,
            username,
            email,
            provider: "github",
            providerId: profile.id,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;