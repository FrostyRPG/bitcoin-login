var mongoose = require('mongoose');

// User Schema
var userSchema = mongoose.Schema({
	privKey: {
		type: String,
	},
	password: {
		type: String
	},
});


var User = mongoose.model('User', userSchema);
module.exports = User;


//var User = module.exports;