/* Magic Mirror
 * Module: MMM-RNV
 *
 * By Stefan Krause http://yawns.de
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');
var parseString = require('xml2js').parseString;

module.exports = NodeHelper.create({

	start: function() {
		this.started = false;
		this.config = null;
	},

	getData: function() {
		var self = this;
		
		var myUrl = this.config.timetableUrl + this.config.busStopId;
				
		request({
			url: myUrl,
			method: 'GET'
		}, function (error, response, body) {
			
			if (!error && response.statusCode == 200) {
				parseString(body, function(err, result){
					self.sendSocketNotification("DATA", result);
				});
			}
		});

		setTimeout(function() { self.getData(); }, this.config.updateInterval);
	},

	socketNotificationReceived: function(notification, payload) {
	// Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		var self = this;
		//if (notification === 'CONFIG' && self.started == false) {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData();
			self.started = true;
		//}
	}
});