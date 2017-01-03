var mongoose = require('mongoose');

// User Schema
var UserSchema = mongoose.Schema({
	privKey: {
		type: String,
	},
	password: {
		type: String
	},
});

var User = module.exports;