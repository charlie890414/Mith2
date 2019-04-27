var mongoose = require('mongoose');

var menu = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'account'
  },
  title: {type: String, unique: true},
  content: [{
    type: Map,
    of: String
  }],  
  movie_amount: Number,
  like_amount: Number,
  dislike_amount: Number,
  follower_amount: Number
});

/* export module */
module.exports = mongoose.model('menu', menu);