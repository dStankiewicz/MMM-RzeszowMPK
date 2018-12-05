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
 		updateInterval: 10 * 1000,
 		timetableUrl: 'http://einfo.erzeszow.pl/Home/GetTimetableReal?busStopId=',
 		header: 'Rzeszów MPK',
 		5: "Matysówka",
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
		return ["timetable.css", "https://use.fontawesome.com/releases/v5.5.0/css/all.css"];
	},

	isSoon: function(single) {
		if (single.includes('min'))
		{
			return true;
		}
		return false;
	},

	getMinToGo: function(single) {
		if (single === "<1min")
		{
			return 0;
		}
		return single.substring(0, single.indexOf(" "));
	},

	isTicketMachine: function(single) {
		return single.$["vuw"].includes('B');
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
			var opacity = 1 - c / this.timetable.Schedules.Stop[0].Day[0].R.length;
			var singleDiv = document.createElement('div');
			singleDiv.style = "opacity: " + opacity + ";";

			var single = this.timetable.Schedules.Stop[0].Day[0].R[c];
			var lineNr = single.$["nr"];
			var lineNrWrapper = document.createElement('div');
			lineNrWrapper.className = "inline title bright left"
			lineNrWrapper.innerHTML = lineNr;
			singleDiv.appendChild(lineNrWrapper);

			var desc = document.createElement('div');
			desc.className = "inline bright left desc";
			if (typeof this.config[lineNr] !== "undefined")
			{
				desc.innerHTML = this.config[lineNr];
			}
			singleDiv.appendChild(desc);

			var time = document.createElement('div');
			var timeValue = single.S[0].$["t"];
			if (this.isSoon(timeValue))
			{
				var minutes = this.getMinToGo(timeValue);
				if (minutes < 16 && minutes >= 6)
				{
					time.className = "yellow ";
				}
				if (minutes < 6)
				{
					time.className = "red ";
				}
			}
			time.innerHTML = timeValue;
			time.className += "inline time bright right ";
			singleDiv.appendChild(time);

			var ticketsWrapper = document.createElement('div');
			ticketsWrapper.className = "inline bright right "
			if (this.isTicketMachine(single))
			{
				ticketsWrapper.innerHTML = '<span class="fa fa-tablet"></span>';
			}
			singleDiv.appendChild(ticketsWrapper);
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