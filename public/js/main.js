$(document).ready(function(){

	var handlers = [
		function(i){
			$.post('/lastfm', function(data) {
				$this = $(".music");
				$this.find(".label").text(data.nowPlaying ? "Currently listening to" : "Last listened to");
				$this.find(".data").text(data.artist + " - " + data.title);
				$this.addClass("fadeInLeft");
			});
		},
		function(i){
			$.post("/steam", function(data){
				$this = $(".game");
				$this.find(".label").text(data.isPlaying ? "Currently playing" : "Last played");
				$this.find(".data").text(data.game);
				$this.addClass("fadeInLeft").css("animation-delay", (i * 0.25) + "s");
			});
		},
		function(i){
			$.post("/netflix", function(data){
				$this = $(".tv");
				$this.find(".data").text(data.fulltitle);
				$this.addClass("fadeInLeft").css("animation-delay", (i * 0.25) + "s");
			});
		}
	];

	requestData();
	setInterval(requestData, 5000);

	function requestData(){
		for (let i in handlers){
			handlers[i](i);
		}
	}

});
