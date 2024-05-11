// passport-config.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');

passport.use('local', new LocalStrategy(
{ usernameField: 'email' },
async (email, password, done) => {
    try {
      // Find user by email
    const user = await User.findOne({ email });

      // If user not found or password does not match, return error
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return done(null, false, { message: 'Incorrect email or password.' });
    }

      // If user and password match, return user
    return done(null, user);
    } catch (error) {
    return done(error);
    }
}
));

passport.use('google', new GoogleStrategy({
clientID: process.env.GOOGLE_CLIENT_ID,
clientSecret: process.env.GOOGLE_CLIENT_SECRET,
callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
try {
    // Check if user already exists in database
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // If user doesn't exist, create a new user
    user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName
        // Add other relevant user properties as needed
    });
    await user.save();
    }

    // Return the user object
    done(null, user);
} catch (error) {
    done(error);
}
}));

passport.serializeUser((user, done) => {
done(null, user.id);
});

passport.deserializeUser((id, done) => {
User.findById(id, (err, user) => {
    done(err, user);
});
});
