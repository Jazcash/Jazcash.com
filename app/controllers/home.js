var express = require("express"),
	router = express.Router(),
	cheerio = require("cheerio"),
	request = require("request").defaults({jar: true}),
	moment = require("moment"),
	fs = require("fs"),
	config = {},
	data = {};

try {
    stats = fs.lstatSync("config.json");
    if (stats.isFile()) {
        config = JSON.parse(fs.readFileSync("config.json"));
    }
} catch(e){
    console.log("No config.json file found - exiting".error);
    process.exit(1);
}

var handlers = {
	lastfm: function(){
		try {
			console.log("Fetching Last.fm data...");
			var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+config.lastfm.username+"&api_key="+config.lastfm.apikey+"&format=json&limit=1&extended=1"
			request(url, {headers: {'User-Agent': "NodeJS"}}, function(error, response, body){
			    if (!error && response.statusCode == 200) {
			        var track = JSON.parse(body).recenttracks.track[0];
			        data.lastfm = {
			            title: track.name,
			            artist: track.artist.name,
			            nowPlaying: ("@attr" in track) ? track["@attr"].nowplaying : false
			        };
			        console.log("Last.fm fetch successful");
			    }
			});
		} catch (e){
			console.log("Last.fm fetch failed");
			console.log(err.message);
			console.log(err.stack);
		}
	},
	netflix: function(){
		try {
			console.log("Fetching Netflix data...");
			var url = "https://www.netflix.com/Login";
			request(url, {headers: {'User-Agent': "NodeJS"}}, function (error, response, body) {
			    if (!error && response.statusCode == 200) {
			        var $ = cheerio.load(body);
			        var authCode = $("#login-form > input").attr("value");
			        request.post({url: url,
			            form: {
			                "email": config.netflix.username,
			                "password": config.netflix.password,
			                "authURL": authCode,
			                "RememberMe": "on"
			            },
			            headers:{
			                'User-Agent': "NodeScrape"
			            }
			        }, function(err, response, body){
			            var cookies = response.headers['set-cookie'];
			            request({url: "https://www.netflix.com/WiViewingActivity", headers: {'Cookie': cookies, 'User-Agent': "NodeJS"}}, function(error, response, body){
			                var $ = cheerio.load(body);
			                var wasSuccessful = $(".seriestitle").length > 0;
			                if (!wasSuccessful) return;
			                data.netflix = {
			                	title: $(".seriestitle").eq(0).text(),
			                	fulltitle: $(".title").eq(0).text()
			                };
			                console.log("Netflix fetch successful");
			            });
			        });
			    }
			});
		} catch (e){
			console.log("Netflix fetch failed");
			console.log(err.message);
			console.log(err.stack);
		}
	},
	steam: function(){
		try {
			console.log("Fetching Steam data...");
			var url = "http://steamcommunity.com/id/"+config.steam.username;
			request(url, {headers: {'User-Agent': "NodeJS"}}, function(error, response, body){
			    if (!error && response.statusCode == 200) {
			        var $ = cheerio.load(body);
			        var isPlaying = $(".profile_in_game_name").length > 0;
			        data.steam = {
			        	game: isPlaying ? $(".profile_in_game_name").eq(0).text() : $(".game_name a:first-child").eq(0).text(),
			        	isPlaying: isPlaying
			        };
			        console.log("Steam fetch successful");
			    }
			});
		} catch (e){
			console.log("Steam fetch failed");
			console.log(err.message);
			console.log(err.stack);
		}
	},
	github: function(){
		try {
			console.log("Fetching Github data...");
			var url = "https://"+config.github.username+":"+config.github.accesstoken+"@api.github.com/users/"+config.github.username+"/events?page=1&per_page=1";
			request(url, {headers: {'User-Agent': "NodeJS"}}, function(error, response, body){
			    if (!error && response.statusCode == 200) {
			        var githubdata = JSON.parse(body)[0];
			        data.github = {
			        	repo: githubdata.repo,
			        	commits: githubdata.payload.commits,
			        	public: githubdata.public,
			        	time: githubdata["created_at"],
			        	repourl: githubdata.repo.url
			        };
			        console.log("Github fetch successful");
			    }
			});
		} catch (e){
			console.log("Github fetch failed");
			console.log(err.message);
			console.log(err.stack);
		}
	}
};

for (var key in handlers){
	handlers[key]();
}

setInterval(function(){
	handlers.lastfm();
}, 15000); // 15 seconds

setInterval(function(){
	handlers.netflix();
}, 1800000); // 30 minutes

setInterval(function(){
	handlers.steam();
}, 180000); // 3 minutes

setInterval(function(){
	handlers.github();
}, 300000); // 5 minutes

module.exports = function(app) {
	app.use("/", router);
};

router.get("/", function(req, res, next) {
	res.render("index", {
		title: "Jazcash",
	});
});

router.post("/fetchdata", function(req, res, next){
	res.send(data);
});
