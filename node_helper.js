'use strict';
const NodeHelper = require('node_helper');
const request = require('request');
const PythonShell = require('python-shell');
// this.pythonStarted = false

module.exports = NodeHelper.create({

  python_start: function() {
    const self = this;
    const pyshell = new PythonShell('modules/' + this.name + '/code/smile_cascade.py', {
      mode: 'json',
      args: [JSON.stringify(this.config)]
    });
    console.log("python start")
    pyshell.on('message', function(message) {

      if (message.hasOwnProperty('result')) {
        console.log("[" + self.name + "] " + (message.result));
        self.sendSocketNotification('RESULT', message.result);

      } else if (message.hasOwnProperty('error')) {
        console.log("[" + self.name + "] " + message.error.err_msg)
        self.sendSocketNotification('RESULT', {

          error: message.error.err_msg
        });
      }
    });

    pyshell.end(function(err) {
      if (err) throw err;
      console.log("[" + self.name + "] " + 'finished running...');
    });
  },

  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {

    if (notification === 'START_TEST') {
      this.config = payload
        // if (!this.pythonStarted) {
        // this.pythonStarted = true;
      this.python_start();
      // }
    } else if (notification === 'GET_GIF') {
      const self = this
      const animals = ['cat', 'dog', 'monkey', 'llama', 'donkey', 'pig', 'horse', 'sheep', 'goat']
      var randomIndex = Math.floor(Math.random() * animals.length)
      var randomAnimal = animals[randomIndex]

      var giphyApiUrl = "http://api.giphy.com/v1/gifs/search?q=" + randomAnimal + "&api_key=dc6zaTOxFJmzC"

      request.get(giphyApiUrl, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var gifUrl = JSON.parse(body).data[0].images.fixed_height.url

          self.sendSocketNotification("GIF", gifUrl);
        }
      })
    }
  }
});