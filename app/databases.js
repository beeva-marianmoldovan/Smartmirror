'use strict';

var mongoose = require( 'mongoose' );

mongoose.connect( 'mongodb://boss:MargaretT4ch3r@ds059519.mongolab.com:59519/smartmirror' );
//mongoose.connect( 'mongodb://127.0.0.1:27017/smartmirror' );

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
});

var Schema   = mongoose.Schema;

var User = new Schema({
    name            : { type : String },
    email           : { type : String },
    token           : { type : String },
    faceId		    : { type : String }
});
mongoose.model( 'User', User );

var Ambient = new Schema({
    place            : { type : String, required : true },
    temperature      : { type : Number },
    pression         : { type : Number }
});
mongoose.model( 'Ambient', Ambient );