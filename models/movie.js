var mongoose = require('mongoose');

var movie = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account'
    },
    depend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menu'
    },
    movie: String
});

/* export module */
module.exports = mongoose.model('movie', movie);