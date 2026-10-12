const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const clientModel = require('../model/client');
const googleOAuthConfigured = [
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
].every(Boolean);

if (googleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },

      async (accessToken, refreshToken, profile, cb) => {
        try {
          const email = profile.emails?.[0]?.value || profile._json?.email;
          const firstName = profile.name?.givenName || profile.displayName || 'Google';
          const lastName = profile.name?.familyName || 'User';

          if (!email) {
            return cb(new Error('Google did not return an email address'), null);
          }

          let client = await clientModel.findOne({ email });

          if (!client) {
            client = await clientModel.create({
              firstName,
              lastName,
              email,
              password: ' ',
              isVerified: profile._json.email_verified
            });
          }

          return cb(null, client);
        } catch (error) {
          console.log('Error signing up with google', error.message);
          return cb(error, null);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth is disabled. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL to enable it.');
}

passport.serializeUser((client, cb) => {
  cb(null, client.id);
});

passport.deserializeUser(async (id, cb) => {

  try {

    const client = await clientModel.findById(id);

    if (!client) {
      return cb(new Error('User not found'), null);
    }

    cb(null, client);

  } catch (error) {

    cb(error, null);

  }

});

const authenticateGoogle = (options) => (req, res, next) => {
  if (!googleOAuthConfigured) {
    return res.status(503).json({ message: 'Google OAuth is not configured' });
  }

  return passport.authenticate('google', options)(req, res, next);
};

const profile = authenticateGoogle({
  scope: ['profile', 'email']
});

const loginProfile = authenticateGoogle({
  failureRedirect: '/login',
  session: false
});

module.exports = { passport, profile, loginProfile };
