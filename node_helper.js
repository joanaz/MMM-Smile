'use strict';
const NodeHelper = require('node_helper');
const request = require('request');
const PythonShell = require('python-shell');

module.exports = NodeHelper.create({

  python_start: function() {
    const self = this;
    const pyshell = new PythonShell('modules/' + this.name + '/code/smile_cascade.py', {
      mode: 'json',
      args: [JSON.stringify(this.config)]
    });

    pyshell.on('message', function(message) {
      if (message.hasOwnProperty('camera_ready')) {
        console.log("[" + self.name + "] " + 'camera ready')

        const animals = ['cat', 'dog', 'monkey', 'llama', 'donkey', 'pig', 'horse', 'sheep', 'goat']
        var randomIndex = Math.floor(Math.random() * animals.length)
        var randomAnimal = animals[randomIndex]

        self.sendGIF(randomAnimal)

      } else if (message.hasOwnProperty('result')) {
        console.log("[" + self.name + "] " + (message.result));
        self.sendSocketNotification('RESULT', message.result);
      } else if (message.hasOwnProperty('error')) {
        console.log("[" + self.name + "] " + (message.error));
        self.restart = true
          // self.sendSocketNotification('RESULT', message.result);
      } else {
        console.log("[" + self.name + "] " + message)
      }

    });

    pyshell.end(function(err) {
      if (err) throw err;
      if (self.restart) {
        console.log("[" + self.name + "] " + 'restarting...');
        setTimeout(function() {
          self.python_start()
        }, 30 * 1000);
      } else {
        console.log("[" + self.name + "] " + 'finished running...');
      }
    });
  },

  sendGIF: function(searchTerm) {
    var self = this
    var giphyApiUrl = "http://api.giphy.com/v1/gifs/search?q=" + searchTerm + "&api_key=dc6zaTOxFJmzC"

    request.get(giphyApiUrl, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var gifUrl = JSON.parse(body).data[0].images.fixed_height.url

        self.sendSocketNotification("GIF", gifUrl);
      }
    })
  },

  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'START_TEST') {
      this.config = payload
      this.python_start();
    } else if (notification == "PASSED_TEST") {
      this.sendGIF("clapping")
    }
  }
});