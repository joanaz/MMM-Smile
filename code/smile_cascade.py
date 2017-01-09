from imutils.video import VideoStream
from datetime import datetime
import imutils
import cv2
import numpy as np
import sys
import json
import os
import time
import inspect


# Configuration from MMM
CONFIG = json.loads(sys.argv[1])

# Computer vision lib files needed by OpenCV
path_to_file = os.path.dirname(os.path.abspath(
    inspect.getfile(inspect.currentframe())))
facePath = path_to_file + '/haarcascade_frontalface_default.xml'
smilePath = path_to_file + '/haarcascade_smile.xml'
faceCascade = cv2.CascadeClassifier(facePath)
smileCascade = cv2.CascadeClassifier(smilePath)

log_path = path_to_file + '/../log/'
if not os.path.exists(log_path):
  os.makedirs(log_path)

# track smile time
smileTime = 0


def to_node(type, message):
  # Send message to MMM
  # convert to json and print (node helper will read from stdout)
  try:
    print(json.dumps({type: message}))
  except Exception:
    pass
  # stdout has to be flushed manually to prevent delays in the node helper
  # communication
  sys.stdout.flush()


# *************************************************************
# Main function
# *************************************************************

# Start video stream
vs = VideoStream(usePiCamera=CONFIG['usePiCam']).start()

# allow the camera sensor to warmup
time.sleep(2)
to_node('camera_ready', True)


while True:
  # take a frame every second
  time.sleep(1)

  # use VS instead of cv2.VideoCapture
  frame = vs.read()

  gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

  faces = faceCascade.detectMultiScale(
      gray,
      scaleFactor=1.1,
      minNeighbors=8,
      minSize=(100, 100),
      flags=cv2.CASCADE_SCALE_IMAGE
  )

  for (x, y, w, h) in faces:
    roi_gray = gray[y:y + h, x:x + w]
    roi_color = frame[y:y + h, x:x + w]

    smile = smileCascade.detectMultiScale(
        roi_gray,
        scaleFactor=1.8,
        minNeighbors=25,
        minSize=(25, 25),
        flags=cv2.CASCADE_SCALE_IMAGE
    )

    if(len(smile) > 0):
      smileTime += 1
      to_node('result', smileTime)

      # log the smile test with a selfie
      if smileTime == (CONFIG['smileLength'] / 2):
        cv2.imwrite(log_path + datetime.now().isoformat("T") + '.jpg', frame)

  if cv2.waitKey(1) & 0xFF == ord('q'):
    break

  if smileTime >= CONFIG['smileLength']:
    smileTime = 0
    break

cv2.destroyAllWindows()
vs.stop()
