"use strict";
console.clear();

var appClosure = function(){

	const LOCAL_STORAGE_KEY = "tweets";
	const SEP = "#@#@#";

	let app = {
		
		init : function() {

			let _this = this;
			this.loadTweets();

			$("#searchButton").on("click", function(ev){
				let text = $("#searchText").val();
				let endpoint = `http://tweetsaver.herokuapp.com/?q=${text}&callback=?&count=10`;
				let endpointEncoded = encodeURI(endpoint);

				$("#box1").empty();
		   		if (text == null || text == "") {
					return;
				}
				if (endpointEncoded.length > 1000) {
					alert("Search criteria too large");
					return false;
				}

				$.getJSON(endpointEncoded, function(data) {
					for (let tweet of data.tweets) {
						this.addRow({ box: "#box1", name: tweet.user.name, image: tweet.user.miniProfileImageURL, 
							date: new Date(tweet.createdAt).toISOString().slice(0,10), text: tweet.text, isDraggable: true });
					}
				}.bind(_this)); // or _this.addRow instead.
			});
		},

		addRow : function(tweet) {

			let block = `<div class="tweetItem" draggable="${tweet.isDraggable}" ondragstart="appClosure.dragStart(event)"> 
		    			<div class="tweetItemCol"><img id="picture" src="${tweet.image}"></div> 
		    			<div class="tweetItemCol"> 
			    			<div class="tweetItemCol2"> 
			    				<div class="tweetMessageCol"> 
			    					<div class=""> 
			    						<span style="font-weight: 700; padding-right: 3px;">Full Name</span>  
			    						@<span id="fullname">${tweet.name}</span><br> 
			    					</div> 
			    					<div id="date">${tweet.date}</div> 
			    				</div> 
			    				<div id="result">${tweet.text}</div> 
			    			</div> 
			    		</div> 
	    			</div>`;

		    $(block).appendTo($(tweet.box));
		},

		loadTweets : function() {

			$("#box2").empty();

			let storedTweets = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (storedTweets == null) {
				return;
			}

			let storedTweetsArr = storedTweets.split(SEP);
			for (let item of storedTweetsArr) {
				let tweet = JSON.parse(item);
				this.addRow({ box: "#box2", name: tweet.name, image: tweet.image, date: tweet.date, text: tweet.text, isDraggable: false });
			}
		},

		drop : function(ev) {
			
			let tweet = ev.dataTransfer.getData('text');

			let storedTweets = localStorage.getItem(LOCAL_STORAGE_KEY);
			let storedTweetsArr = [];
			if (storedTweets != null) {
				storedTweetsArr = storedTweets.split(SEP);
			}
			storedTweetsArr.push(tweet);

			var toStorage = storedTweetsArr.join(SEP);
			localStorage.setItem(LOCAL_STORAGE_KEY, toStorage);
			this.loadTweets();
			$("#box2").css({"background-color":"#eee", "border":"1px solid #eee"});
		    ev.preventDefault();
		},

		dragOver : function(ev) {
			$("#box2").css({"background-color":"lightyellow", "border":"1px solid red"});
	    	ev.preventDefault();
		},

		dragLeave : function(ev) {
			$("#box2").css({"background-color":"#eee", "border":"1px solid #eee"});
	    	ev.preventDefault();
		},

		dragStart : function(ev) {
			let date = $(ev.target).find("#date").text();
			let image = $(ev.target).find("#picture").attr('src');
			let name = $(ev.target).find("#fullname").text();
			let text = $(ev.target).find("#result").text();
		    ev.dataTransfer.setData('text', JSON.stringify({date: date, name: name, image: image, text : text}));
		}

	};

	return app;
}(); // IIFE - Imemediately invoked function expression

window.onload = appClosure.init();

