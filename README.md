# MMM-Smile

This is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror). It displays a random funny GIF on the magic mirror, then conducts smiling test for the current user by detecting smiling faces on camera using Haar Cascades, and saves the images in the log folder. 

Reference: [REAL-TIME SMILE DETECTION IN PYTHON OPENCV](http://pushbuttons.io/blog/2015/4/27/smile-detection-in-python-opencv).

## Usage

The entry in config.js can look like the following. (NOTE: You only have to add the variables to config if you want to change its standard value.)

```Javascript
{
	module: 'MMM-Smile',
    position: "middle_center",
	config: {
        // recognition interval in ms, default to 8 hours
        interval: 8 * 60 * 60 * 1000,
        // total test running time in seconds
        testRunTime: 120,
        // the smiling period in seconds in order to pass the test
        smileLength: 5,
        // use pi camera by default; set it to false for laptop camera
        usePiCam: true
	}
}
```


## Dependencies
- [python-shell](https://www.npmjs.com/package/python-shell) (installed via `npm install`)
- [OpenCV](http://opencv.org) 
    - Mac: `brew install opencv`
	- Linux: `sudo apt-get install libopencv-dev python-opencv` 
    - Raspberry Pi: follow this [guide](http://www.pyimagesearch.com/2016/04/18/install-guide-raspberry-pi-3-raspbian-jessie-opencv-3/), will take few hours
	

