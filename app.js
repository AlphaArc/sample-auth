const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectDB = require("./db");
const User = require('./model/User'); // Assuming this is your User model
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();

const app = express();

// console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

// Database Connection
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' }, // Assuming you use email as username
    async (email, password, done) => {
        try {
            // Find user by email
            const user = await User.findOne({ email });

            // If user not found or password does not match, return error
            if (!user || !(await user.comparePassword(password))) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            // If user and password match, return user
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Configure Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
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
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});


// app.use(passport.initialize());
// app.use(passport.session());

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on("unhandledRejection", (err) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});