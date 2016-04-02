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

fetchAll();
setInterval(fetchAll, 10000);

module.exports = function(app) {
	app.use("/", router);
};

router.get("/", function(req, res, next) {
	res.render("index", {
		title: "Jazcash",
	});
});

router.post("/lastfm", function(req, res, next) {
	res.send(data.lastfm);
});

router.post("/steam", function(req, res, next){
	res.send(data.steam);
});

router.post("/netflix", function(req, res, next){
	res.send(data.netflix);
});

function fetchAll(){
	fetchLastfm();
	fetchSteam();
	fetchNetflix();
}

function fetchLastfm(){
	var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+config.lastfm.username+"&api_key="+config.lastfm.apikey+"&format=json&limit=1&extended=1"
	request(url, {headers: {'User-Agent': "NodeJS"}}, function(error, response, body){
	    if (!error && response.statusCode == 200) {
	        var track = JSON.parse(body).recenttracks.track[0];
	        data.lastfm = {
	            title: track.name,
	            artist: track.artist.name,
	            nowPlaying: ("@attr" in track) ? track["@attr"].nowplaying : false
	        }
	    }
	});
}

function fetchSteam(){
	var url = "http://steamcommunity.com/id/"+config.steam.username;
	request(url, {headers: {'User-Agent': "NodeJS"}}, function(error, response, body){
	    if (!error && response.statusCode == 200) {
	        var $ = cheerio.load(body);
	        data.steam = {
	        	game: $(".game_name a:first-child").eq(0).text(),
	        	isPlaying: $(".profile_in_game_name").length > 0
	        }
	    }
	});
}

function fetchNetflix(){
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
	                data.netflix = {
	                	title: $(".seriestitle").eq(0).text(),
	                	fulltitle: $(".title").eq(0).text()
	                }
	            });
	        });
	    }
	});
}
