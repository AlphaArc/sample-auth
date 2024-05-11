var path = require('path');

var passport=require('passport');
var User = require(path.join(__dirname, '..', 'models', 'user.model'));

module.exports = function(passport) {

    passport.serializeUser(function(user, done){
        done(null, false);
    });
    passport.deserializeUser(function(id, done){
        console.log("deserializeUser called", id);
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    require(path.join(__dirname, 'strategies', 'local-strategy'));
}