'use strict';

var twitter = require('twitter');

var twit = new twitter({
  //consumer_key: 'xlzZNPECqcMGijgjRzh6jw0yMQ',
  consumer_key: 'lzZNPECqcMGijgjRzh6jw0yMQ',
  //consumer_secret: 'mxdEF7DVVyIj5CP4JnThDIx7qzrFKaMx98UU5GJfh5NF6ib0gGC',
  consumer_secret: 'mdEF7DVVyIj5CP4JnThDIx7qzrFKaMx98UU5GJfh5NF6ib0gGC',
  //access_token_key: '339x872696-m5kqo5AFYfArm1dnemJF6GEQU3EOtYYvYhUXJgBx',
  access_token_key: '339872696-m5kqo5AFYfArm1dnemJF6GEQU3EOtYYvYhUXJgBx',
  //access_token_secret: '3Wk1xpEz1jUQ5AAMmNU1mTkyHxAWCGrbJg0xmBdO2AjZFP'
  access_token_secret: '3Wk1pEz1jUQ5AAMmNU1mTkyHxAWCGrbJg0xmBdO2AjZFP'
});


exports.twitterFeed = function(req, res) {
	var params = {screen_name: 'beeva_es'};
	twit.get('statuses/user_timeline', params, function(error, tweets, response){
		if (!error) {
			tweets = tweets.filter(function(item){
				if(item.text.substring(0,2) === 'RT')
					return false;
				return true;
			});
			var tweets = tweets.map(function(item){
				return {'tweet' : item.text};
			});
			res.json(tweets);
		}
		else res.status(500).end();
	});
};