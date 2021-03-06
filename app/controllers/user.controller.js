'use strict';

require('../models/user.model');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');

exports.auth = function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) {
      res.json(err);
    }

    if (!user) {
      res.json({
        success: false,
        message: 'auth failed'
      });
    } else if (user) {
      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'auth failed'
        });
      } else {
        var token = jwt.sign(user, process.env.NODE_SECRET, {
          expiresIn: 86400
        });

        res.json({
          id: user._id,
          user: user.firstname,
          success: true,
          message: 'token Created',
          token: token
        });
      }
    }
  });
};
exports.generateToken = function(user) {
  var token = jwt.sign(user, process.env.NODE_SECRET, {
    expiresIn: 86400
  });
  return token;
};

exports.verifyToken = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, process.env.NODE_SECRET, function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided'
    });
  }
};

exports.createUser = function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (user) {
      res.json({
        sucess: false,
        message: 'user email taken'
      });
    } else {
      User.create(req.body, function(err, user) {
        if (err) {
          return res.json(err);
        }
        return res.json(user);
      });
    }
  });
};

exports.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err) {
      return res.json(err);
    }
    return res.json(users);
  });
};

exports.deleteAll = function(req, res) {
  User.remove(function(err, users) {
    if (err) {
      return res.json(err);
    }
    exports.getUsers(req, res);
  });
};

exports.findUser = function(req, res) {
  User.find({
    _id: req.params.id
  }, function(err, user) {
    if (err) {
      return res.json(err);
    }
    return res.json(user);
  });
};

exports.getMe = function(req, res) {
  User.find({
    _id: req.params.id
  }, function(err, user) {
    if (err) {
      return res.json(err);
    }
    return res.json(user);
  });
};

exports.updateUser = function(req, res) {
  User.update({
    _id: req.params.id
  }, req.body, function(err, user) {
    if (err) {
      return res.json(err);
    }
      exports.findUser(req, res);
  });
};

exports.deleteUser = function(req, res) {
  User.remove({
    _id: req.params.id
  }, function(err, user) {
    if (err) {
      return res.json(err);
    }
    res.json({
      success: true,
      message: 'user deleted'
    });
  });
};
