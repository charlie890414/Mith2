var mongoose = require('mongoose');

var account = mongoose.Schema({
    account: {type: String, unique: true},
    password: String,
    token: String,
    follow: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account'
    }]
});

/* export module */
module.exports = mongoose.model('account', account);