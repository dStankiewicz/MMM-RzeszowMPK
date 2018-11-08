"use strict";
/* global Module */

/* Magic Mirror
 * Module: MMM-RzeszowMPK
 *
 * By Dawid Stankiewicz http://dstan.pl
 * MIT Licensed.
 */

 Module.register("MMM-RzeszowMPK", {
 	defaults: {
 		busStopId: 5,
 		updateInterval: 60 * 1000,
 		timetableUrl: 'http://einfo.erzeszow.pl/Home/GetTimetableReal?busStopId=',
 		header: 'Rzeszów MPK'
 	},

	start: function() {
		Log.info("Starting module: " + this.name);

		this.loaded = false;
		this.sendSocketNotification('CONFIG', this.config);
		//this.scheduleUpdate(this.config.initialLoadDelay);
		//this.updateTimetable();
		this.timetable = null;
		this.updateTimer = null;


	},

	getStyles: function () {
		return ["timetable.css"];
	},

 	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		wrapper.className = "small";

		for (var c in this.timetable.Schedules.Stop[0].Day[0].R)
		{
			var singleDiv = document.createElement('div');

			var single = this.timetable.Schedules.Stop[0].Day[0].R[c];
			var lineNr = document.createElement('div');
			lineNr.className = "inline title bright left"
			lineNr.innerHTML = single.$["nr"];
			singleDiv.appendChild(lineNr);

			var time = document.createElement('div');
			time.innerHTML = single.S[0].$["t"];
			time.className = "inline time bright right";
			singleDiv.appendChild(time);
			// line.
			wrapper.appendChild(singleDiv);
		};

 		return wrapper;
 	},

	updateTimetable: function() {
		var url = this.config.timetableUrl + this.config.busStopId;
		var self = this;

		var timetableRequest = new XMLHttpRequest();
		timetableRequest.open("GET", url, true);
		timetableRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
				}
			}
		}
		timetableRequest.send();
	}, 

 	socketNotificationReceived: function(notification, payload) {
    		if (notification === "STARTED") {
				this.updateDom();
			}
			else if (notification === "DATA") {
				this.loaded = true;
				this.timetable = payload;
				this.updateDom();
    		}
	},

	getHeader: function() {
		if (this.loaded) {
			return this.timetable.Schedules.Stop[0].$["name"];
		}
		else {
			return this.data.header;
		}
	}
 });