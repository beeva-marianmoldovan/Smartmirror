'use strict';

var twitter = require('twitter');

var twit = new twitter({

  consumer_key: 'lxzZNPECqcMGijgjRzh6jw0yMQ',
  consumer_secret: 'mdxEF7DVVyIj5CP4JnThDIx7qzrFKaMx98UU5GJfh5NF6ib0gGC',
  access_token_key: '3398x72696-m5kqo5AFYfArm1dnemJF6GEQU3EOtYYvYhUXJgBx',
  access_token_secret: '3Wk1xpEz1jUQ5AAMmNU1mTkyHxAWCGrbJg0xmBdO2AjZFP'
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