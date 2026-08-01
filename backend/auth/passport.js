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
        // 1. Check if this GitHub account is already linked to a user
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerId: {
              provider: "github",
              providerId: profile.id,
            },
          },
          include: { user: true },
        });

        if (existingAccount) {
          // Account already exists, return the associated user
          return done(null, existingAccount.user);
        }

        const email =
          profile.emails?.[0]?.value || `${profile.username}@github.local`;
        const name = profile.displayName || profile.username;
        const githubUsername = profile.username;

        // 2. Check if a user exists with this email (account linking)
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // User exists - link this GitHub account to existing user
          await prisma.account.create({
            data: {
              userID: user.id,
              provider: "github",
              providerId: profile.id,
            },
          });
          return done(null, user);
        }

        // 3. New user - create User + Account atomically
        // Handle potential username conflicts by appending random suffix
        let username = githubUsername;
        let usernameExists = await prisma.user.findUnique({
          where: { username },
        });

        if (usernameExists) {
          // Username taken, append random suffix
          username = `${githubUsername}_${Math.random().toString(36).substring(2, 8)}`;
        }

        // Create user and account in a transaction to ensure atomicity
        user = await prisma.user.create({
          data: {
            name,
            username,
            email,
            accounts: {
              create: {
                provider: "github",
                providerId: profile.id,
              },
            },
          },
        });

        return done(null, user);
      } catch (error) {
        console.error("GitHub OAuth error:", error);
        return done(error, null);
      }
    },
  ),
);

export default passport;
