'use strict';

(function(){
	var keys = require('./keys.js');
	var Twitter = require('twitter');
	var Spotify = require('node-spotify-api');
	var request = require('request');
	var fs = require('fs');
	// console.log('keys',keys);

	// var op = process.argv[2].trim().replace('-','_');
	var op = process.argv[2].trim();
	var query = '';
	for (var i=3; i<process.argv.length; i++) {
		query = query + ' ' + process.argv[i];
	};
	query = query.trim();

	execute(op);
	function execute(op){
		switch(op){
			case 'my-tweets':
				myTweets();
				break;
			case 'spotify-this-song':
				spotify();
				break;
			case 'movie-this':
				movie();
				break;
			case 'do-what-it-says':
				doWhatItSays();
				break;
		}
	}


	function myTweets(){
		var client = new Twitter(keys.twitter);
		var screenName = 'wayncheng';
		var params = {
			screen_name: screenName,
			count: 20,
		};

		client.get('statuses/user_timeline', params, function(error, tweets, response) {
		  if (!error) {
		    // console.log(tweets);
		    logOut(`\n============================================\nLast 20 Tweets from ${screenName}`);

		    for (var i=0; i<tweets.length; i++) {
		    	var ti = tweets[i];
		    	var text = ti.text;
		    	var time = ti.created_at;
		    	var num = i+1;

		    	var out = `\n ${num}.\n   | ${text}\n   | Created at: ${time}`;
		    	logOut(out);
		    };

		    logOut('\n--------------------------------------------\n');
		  }
		});
		
	};

	function spotify(){
		var queryType = 'track';

		if (query.length == 0){
			query = 'The Sign';
			// queryType = 'track,artist';
		}
		// console.log(`\nSearching Spotify for: ${query}`);

		var spotify = new Spotify(keys.spotify);
		spotify.search({
			type: queryType, 
			query: query,
			limit: 1,
		},function(err, data) {
		    if (err) {return console.log('Error occurred: ' + err); }

		    var r = data.tracks.items[0];
		    var artists = r.artists[0].name;
		    var songname = r.name;
		    var previewURL = r.preview_url;
		    var album = r.album.name;

	    	var out = `\n============================================\nSpotify Response for "${query}"\n | Artist: ${artists}\n | Song: ${songname}\n | Album: ${album}\n | Preview URL: ${previewURL}\n----------------------------------------\n`;
	    	logOut(out);
  			
		});

	};

	function movie(){
		if (query.length == 0){
			query = 'Mr. Nobody'
		}
		var movie = encodeURIComponent(query);

		// console.log('Searching OMDB for:',query);

		var apiKey = '40e9cece';
		var qURL = `http://www.omdbapi.com/?t=${movie}&apikey=${apiKey}`;

		request(qURL,
		function(err,resp,body){
			var b = JSON.parse(body);
			// console.log('b',b);

			var imdbRating = 'N/A';
			for (var i=0; i<b.Ratings.length; i++) {
				var ri = b.Ratings[i];
				if (ri.Source == 'Internet Movie Database'){
					imdbRating = ri.Value;
					break;
				}
			};

	    	var out = `\n============================================\nOMDB Response for "${query}"\n | Title: ${b.Title}\n | Year: ${b.Year}\n | Rating: ${imdbRating}\n | Country: ${b.Country}\n | Language: ${b.Language}\n | Plot: ${b.Plot}\n | Actors: ${b.Actors}\n | Website: ${b.Website}\n----------------------------------------\n`;

	    	logOut(out);
		});
	};



	function doWhatItSays(){
		fs.readFile('random.txt','utf8', function(err,data){
			if (err) { console.log(err) }
			else {
				var args = data.split(',');
				op = args[0];
				query = args[1].slice(1,args[1].length-1);
				execute(op);
			}
		})

	};

	function logOut(out){
		console.log(out);

		fs.appendFile('log.txt',out,function(err,data){
				if (err) { return console.log(err) }
		})
	};

})();
