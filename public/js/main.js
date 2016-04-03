$(document).ready(function(){

	function requestData(){
		$.post('/fetchdata', function(data) {
			$music = $(".music");
			$music.find(".label").text(data.lastfm.nowPlaying ? "Currently listening to" : "Last listened to");
			$music.find(".data").text(data.lastfm.artist + " - " + data.lastfm.title);
			$music.addClass("fadeInLeft");

			$game = $(".game");
			$game.find(".label").text(data.steam.isPlaying ? "Currently playing" : "Last played");
			$game.find(".data").text(data.steam.game);
			$game.addClass("fadeInLeft").css("animation-delay", (1 * 0.25) + "s");

			$netflix = $(".tv");
			$netflix.find(".data").text(data.netflix.fulltitle);
			$netflix.addClass("fadeInLeft").css("animation-delay", (2 * 0.25) + "s");

			$github = $(".github");
			$github.find(".data").text(data.github.commits[0].message + " on " + data.github.repo.name.split("/")[1]);
			$github.addClass("fadeInLeft").css("animation-delay", (3 * 0.25) + "s");
		});
	}

	requestData();
	setInterval(requestData, 5000);

	particlesJS.load('particles-js', 'particles.json');

});
