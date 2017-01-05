import cv
import cv2
import numpy as np
import sys
import json
import os
import time
import inspect

CONFIG = json.loads(sys.argv[1])

path_to_file = os.path.dirname(os.path.abspath(
    inspect.getfile(inspect.currentframe())))

facePath = path_to_file + '/haarcascade_frontalface_default.xml'
smilePath = path_to_file + '/haarcascade_smile.xml'
faceCascade = cv2.CascadeClassifier(facePath)
smileCascade = cv2.CascadeClassifier(smilePath)


def to_node(type, message):
  # convert to json and print (node helper will read from stdout)
  try:
    print(json.dumps({type: message}))
  except Exception:
    pass
  # stdout has to be flushed manually to prevent delays in the node helper
  # communication
  sys.stdout.flush()

to_node('test', CONFIG)


def save_image(image):
  # check the timestamp of last image
  cv.SaveImage(path_to_file + '/webcam/' +
               time.asctime() + '.jpg', image)


cap = cv2.VideoCapture(0)
# cap.set(3, 640)
# cap.set(4, 480)

if cap.isOpened():  # try to get the first frame
  rval, frame = cap.read()
else:
  rval = False

smileTime = 0

while rval:
  time.sleep(1)

  ret, frame = cap.read()  # Capture frame-by-frame

  gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

  faces = faceCascade.detectMultiScale(
      gray,
      scaleFactor=1.1,
      minNeighbors=8,
      minSize=(100, 100),
      flags=cv2.cv.CV_HAAR_SCALE_IMAGE
  )
  # ---- Draw a rectangle around the faces

  for (x, y, w, h) in faces:
    # cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
    roi_gray = gray[y:y + h, x:x + w]
    roi_color = frame[y:y + h, x:x + w]

    smile = smileCascade.detectMultiScale(
        roi_gray,
        scaleFactor=1.8,
        minNeighbors=25,
        minSize=(25, 25),
        flags=cv2.cv.CV_HAAR_SCALE_IMAGE
    )

    if(len(smile) > 0):
      if smileTime == (CONFIG['smileLength'] / 2):
        save_image(cv.fromarray(frame))

      smileTime += 1
      to_node('result', smileTime)
    # else:
      # to_node('result', {'smiling': False})

    # Set region of interest for smiles
    # for (x, y, w, h) in smile:
      # print "Found", len(smile), "smiles!"
      # cv2.rectangle(roi_color, (x, y), (x + w, y + h), (255, 0, 0), 2)
      # cv2.putText(roi_color, "SMILING", (x, y), cv2.FONT_HERSHEY_SIMPLEX, 2, 155, 1)

  # cv2.cv.Flip(frame, None, 1)
  # cv2.imshow('Smile Detector', frame)
  if cv2.waitKey(1) & 0xFF == ord('q'):
    break

  if smileTime >= CONFIG['smileLength']:
    break

cap.release()
cv2.destroyAllWindows()
