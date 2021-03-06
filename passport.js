"use strict";
require('./app/models/user.model');
var passport = require('passport'),
  mongoose = require('mongoose'),
  FacebookStrategy = require('passport-facebook').Strategy,
  User = mongoose.model('User'),
  userController = require("./app/controllers/user.controller");

module.exports = function(app) {
  app.use(passport.initialize());

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/#!/home/'
    }),
    function(req, res) {
      var userName = req.user.firstname;
      var jwttoken = userController.generateToken(req.user);
      var userId = req.user._id;
      res.redirect('/#!/user/dashboard?token=' + jwttoken + '&userName=' + userName + '&userId=' + userId);
    });

  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: [
      "email"
    ]
  }));


  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(new FacebookStrategy({
      clientID: process.env.FB_CLIENTID,
      clientSecret: process.env.FB_CLIENTSECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'gender', 'email', 'first_name', 'last_name'],
      enableProof: false
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({'user_id': profile.id}, function(err, user) {
        if (err) {
          done(err);
        }
        var localStorage;
        if (user) {

          return done(null, user);
        } else {
          var result = profile._json;
          var newUser = new User();

          newUser.user_id = result.id;
          newUser.firstname = result.first_name;
          newUser.lastname = result.last_name;
          newUser.email = result.email;
          newUser.gender = result.gender;
          newUser.password = "default";

          newUser.save(function(err) {
            if (err) {
              return done(err);
            } else {
              return done(null, newUser);
            }
          });
        }
      });
    }));
};
