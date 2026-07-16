const passport = require('passport');

// Only initialize LinkedIn strategy if credentials are configured
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/auth/linkedin/callback',
        userProfileURL: 'https://api.linkedin.com/v2/userinfo',
        scope: ['openid', 'profile', 'email'],
        state: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          return done(null, profile);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
