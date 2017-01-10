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
    // smile time in seconds
    smileLength: 5,
    // use pi camera by default
    usePiCam: true,
    // test running time in seconds
    testRunTime: 60
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    var self = this
    this.message = 'Starting smile test...'
    this.gifUrl = ''
    this.clearDom = false
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
  },

  // Override socket notification handler.
  socketNotificationReceived: function(notification, payload) {
    var self = this
    var endTest = false

    if (notification === "GIF") {
      this.gifUrl = payload
      this.message = "Time to smile~";
      this.updateDom()
    } else if (notification === "RESULT") {
      if (payload === -1) {
        this.message = "Sorry, you didn't pass smile test."
        endTest = true
      } else {
        if (payload >= 0 && payload < this.config.smileLength) {
          this.message = "Keep smiling~"
        } else {
          this.message = "Smile test passed!"
          endTest = true
        }

        this.progressBarWidth = Math.round(100 * payload / this.config.smileLength).toString() + "%";
      }
      this.updateDom()
    }

    if (endTest) {
      setTimeout(function() {
        self.clearDom = true;
        self.updateDom()
      }, 1000);
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

      // image.width = this.config.imageSize.toString();
      // image.height = this.config.imageSize.toString();

      wrapper.appendChild(img);
    }

    progressBar = document.createElement("div")
    progressBar.id = "progress-bar"
    progressBar.style.width = this.progressBarWidth
    wrapper.appendChild(progressBar)

    if (this.clearDom) {
      while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild);
      }
    }

    return wrapper;
  }
});