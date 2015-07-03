#!/usr/bin/python
# -*- coding: utf-8 -*-

import base64, time, uuid, requests, cStringIO, cv2, json
from socketIO_client  import SocketIO, LoggingNamespace, BaseNamespace 

from picamera.array import PiRGBArray
from picamera import PiCamera

camera = PiCamera()
camera.rotation = 180
time.sleep(0.5)

socketIO = SocketIO('localhost', 3000, LoggingNamespace)

def get_image():
        print 'Smile'
        rawCapture = PiRGBArray(camera)
	camera.capture(rawCapture, format="bgr")
	image = rawCapture.array
	#cv2.imwrite(str(time.time()) + '.png', image)        
	#image = cv2.resize(frame, (640, 480)) 
	#cv2.imshow('image',image)
	#cv2.waitKey(0)
	#time.sleep(2)
	#cv2.destroyAllWindows()
	return image

def get_base(image):
	cnt = cv2.imencode('.png',image)[1]
	b64 = base64.encodestring(cnt)
	return b64

def detect_face(image):
        print 'Detect face'
	face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
	faces = face_cascade.detectMultiScale(image, 1.3, 5)
	#for (x,y,w,h) in faces:
	#	cv2.rectangle(img,(x,y),(x+w,y+h),(255,0,0),2)
	return faces

def enroll(image, user):
	payload = { 'gallery_name': 'beevatestX', 'selector' : 'FACE'}
	payload['image'] = image 
	payload['subject_id'] = user
	headers = {'Content-Type' : 'application/json', 'app_id' : 'e4f0bc81', 'app_key' : 'x562701d11fc9a9c7eff9a08805ef8ae'}
	r = requests.post("https://api.kairos.com/enroll", data=json.dumps(payload), headers=headers)
	return r

def recognize(image):
	payload = { 'gallery_name': 'beevatestX', 'threshold':0.78, 'max_num_results' : 3}
	payload['image'] = image
	headers = {'Content-Type' : 'application/json', 'app_id' : 'e4f0bc81', 'app_key' : 'x562701d11fc9a9c7eff9a08805ef8ae'}
	r = requests.post("https://api.kairos.com/recognize", data=json.dumps(payload), headers=headers)
	return r

lastHadFace = False

while True:
	img = get_image()
	faces = detect_face(img)

	if faces is not None and len(faces) > 0 :
		raw = recognize(get_base(img)).json()
		result = raw['images'][0]['transaction']
		if result['status']  == 'failure':
                        print 'Nueva Cara'
			faceId = str(uuid.uuid4())
			socketIO.emit('face', {'message': 'new_face', 'faceId' : faceId})
			result = enroll(get_base(img), faceId).json()
			socketIO.emit('face', {'message': 'new_face_snap', 'faceId' : faceId})
			result = enroll(get_base(get_image()), faceId).json()
                        lastHadFace = False
			print result
		else :
			socketIO.emit('face', {'message': 'known_face', 'faceId' :  result['subject'], 'confidence' : result['confidence']})
			print result['status'] + ', ' + result['subject'] + ', ' + result['confidence']
                        lastHadFace = True
		print 'New Face'
	elif len(faces) <= 0 and lastHadFace:
		lastHadFace = False
		socketIO.emit('face', {'message': 'no_face_now'})
		print 'No face now'
	else:
		print faces
		print lastHadFace
		print 'No changes...'

	#time.sleep(2)
