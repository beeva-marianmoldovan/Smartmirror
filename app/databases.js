'use strict';

var mongoose = require( 'mongoose' );

mongoose.connect('mongodb://boss:MargaretT4ch3r@ds059519.mongolab.com:59519/smartmirror');
//mongoose.connect( 'mongodb://127.0.0.1:27017/smartmirror' );

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
});

var Schema = mongoose.Schema;

var UserTokens = new Schema({
	access_token		: { type : String },
	refresh_token		: { type : String },
 	token_type			: { type : String },
  	id_token			: { type : String },
  	expiry_date			: { type : Date }
});

var User = new Schema({
    name            : { type : String },
    email           : { type : String },
    tokens           : [ UserTokens ],
    faceId		    : { type : String }
});
mongoose.model( 'User', User );

var Ambient = new Schema({
    place            : { type : String, required : true },
    temperature      : { type : Number },
    pression         : { type : Number }
});
mongoose.model( 'Ambient', Ambient );

var Room = new Schema({
    location         : { type : String },
    floor            : { type : String },
    room             : { type : String },
    capacity         : { type : String },
    resources        : { type : String },
    name             : { type : String },
    roomId           : { type : String }
});
mongoose.model( 'Room', Room );
