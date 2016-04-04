$(document).ready(function(){

	$music = $(".music");
	$game = $(".game");
	$netflix = $(".tv");
	$github = $(".github");

	function requestData(){
		$.post('/fetchdata', function(data) {
			if ("lastfm" in data){
				$music.parent().show();
				$music.find(".label").text(data.lastfm.nowPlaying ? "Currently listening to" : "Last listened to");
				$music.find(".data").text(data.lastfm.artist + " - " + data.lastfm.title);
				$music.addClass("fadeInLeft");
			} else {
				$music.parent().hide();
			}

			if ("steam" in data){
				$game.parent().show();
				$game.find(".label").text(data.steam.isPlaying ? "Currently playing" : "Last played");
				$game.find(".data").text(data.steam.game);
				$game.addClass("fadeInLeft").css("animation-delay", (1 * 0.25) + "s");
			} else {
				$game.parent().hide();
			}

			if ("netflix" in data){
				$netflix.parent().show();
				$netflix.find(".data").text(data.netflix.fulltitle);
				$netflix.addClass("fadeInLeft").css("animation-delay", (2 * 0.25) + "s");
			} else {
				$netflix.parent().hide();
			}

			if ("github" in data){
				$github.parent().show();
				$github.find(".data").text(data.github.repo.name.split("/")[1]);
				$github.addClass("fadeInLeft").css("animation-delay", (3 * 0.25) + "s");
				$github.parent().attr("href", "https://github.com/" + data.github.repo.name);
			} else {
				$github.parent().hide();
			}
		});
	}

	requestData();
	setInterval(requestData, 5000);

	particlesJS.load('particles-js', 'particles.json');

});
