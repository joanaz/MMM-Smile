/* global Module */

/* Magic Mirror
 * Module: MMM-Smile
 *
 * 
 * MIT Licensed.
 */

Module.register('MMM-Smile', {

  defaults: {
    // recognition interval in ms, default to 8 hours
    interval: 8 * 60 * 60 * 1000,
    // test running time in seconds
    testRunTime: 60,
    // smile time in seconds
    smileLength: 5,
    // use pi camera by default
    usePiCam: true
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    var self = this
    this.show(1000, function() {
      Log.log(this.name + ' is shown.');
    })
    this.message = 'Starting smile test...'
    this.gifUrl = ''
    this.progressBarWidth = 0
    this.getSmileTestResult()

    setTimeout(function() {
      self.start()
    }, this.config.interval);
  },

  getStyles: function() {
    return ["MMM-Smile.css"]
  },

  getSmileTestResult: function() {
    Log.info("Start smile test.");

    this.pythonStarted = false
    this.sendSocketNotification('START_TEST', this.config);
    this.message = "Time to smile~";
  },

  // Override socket notification handler.
  socketNotificationReceived: function(notification, payload) {
    var self = this

    if (notification === "GIF") {
      this.gifUrl = payload
      this.updateDom()
    } else if (notification === "RESULT") {
      if (payload === -1) {
        this.message = "Let's try again"
        setTimeout(function() {
          self.start()
        }, 1000);
      } else {
        if (payload >= 0 && payload < this.config.smileLength) {
          this.message = "Keep smiling~"
        } else {
          this.sendSocketNotification('PASSED_TEST');
          this.message = "Great job!"

          setTimeout(function() {
            self.hide(1000, function() {
              Log.log(self.name + ' is hidden.');
            })
          }, 5000);
        }

        this.progressBarWidth = Math.round(100 * payload / this.config.smileLength).toString() + "%";
      }
      this.updateDom()
    }
  },

  getDom: function() {
    wrapper = document.createElement("div");
    wrapper.className = 'thin large bright';

    var h = document.createElement("p")
    var t = document.createTextNode(this.message);
    h.appendChild(t)
    wrapper.appendChild(h)

    if (this.gitUrl != '') {
      var img = document.createElement("img");
      img.src = this.gifUrl
      wrapper.appendChild(img);
    }

    progressBar = document.createElement("div")
    progressBar.id = "progress-bar"
    progressBar.style.width = this.progressBarWidth
    wrapper.appendChild(progressBar)

    return wrapper;
  }
});