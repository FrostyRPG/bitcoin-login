var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyparser = require("body-parser");
var bitcore = require("bitcore-lib");

var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Create wallet data
function brainWallet(uinput, callback) {
	var input = new Buffer(uinput);
	var hash = bitcore.crypto.Hash.sha256(input);
	var bn = bitcore.crypto.BN.fromBuffer(hash);
	var pk = new bitcore.PrivateKey(bn).toWIF();
	var addy = new bitcore.PrivateKey(bn).toAddress();
	callback(pk, addy);
};

// Register User
router.post('/register', function(req, res){
	var password = req.body.password;
	var password2 = req.body.password2;
	var brainsrc = req.body.brainsrc;
	var brainPK ;
	console.log(brainsrc);
	brainWallet(brainsrc, function(priv, addr) {
		brainPK = priv;
		res.send("The wallet of: " + brainsrc + "<br>Addy: " + addr + "<br>Private Key: " + priv);;
	});

	// Validation
	
	req.checkBody('brainsrc', 'Entropy is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			privKey: brainPK,
			password: password
		});

/*		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

*/
		req.flash('success_msg', 'You are registered and can now login');

//		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(privKey, password, done) {
   User.getUserByPrivKey(privKey, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;