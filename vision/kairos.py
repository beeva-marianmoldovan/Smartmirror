#!/usr/bin/python
# -*- coding: utf-8 -*-

import base64, time, uuid, requests, cStringIO, cv2, json
from socketIO_client import SocketIO, LoggingNamespace, BaseNamespace

cap = cv2.VideoCapture(0)
for i in xrange(20):
	cap.set(i, 0)

socketIO = SocketIO('localhost', 3000, LoggingNamespace)

def get_image():
	cap.open(0)
	ret, image = cap.read()
	cap.release()
	#cv2.imwrite(str(time.time()) + '.png', image)        
	#image = cv2.resize(frame, (640, 480)) 
	#cv2.imshow('image',image)
	#cv2.waitKey(0)
	#cv2.destroyAllWindows()
	return image

def get_base(image):
	cnt = cv2.imencode('.png',image)[1]
	b64 = base64.encodestring(cnt)
	return b64

def detect_face(image):
	face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
	faces = face_cascade.detectMultiScale(image, 1.3, 5)
	#for (x,y,w,h) in faces:
	#	cv2.rectangle(img,(x,y),(x+w,y+h),(255,0,0),2)
	return faces

def enroll(image, user):
	payload = { 'gallery_name': 'beevatest1', 'selector' : 'FACE'}
	payload['image'] = image 
	payload['subject_id'] = user
	headers = {'Content-Type' : 'application/json', 'app_id' : 'e4f0bc81', 'app_key' : 'x562701d11fc9a9c7eff9a08805ef8ae'}
	r = requests.post("https://api.kairos.com/enroll", data=json.dumps(payload), headers=headers)
	return r

def recognize(image):
	payload = { 'gallery_name': 'beevatest1', 'threshold':0.75, 'max_num_results' : 3}
	payload['image'] = image
	headers = {'Content-Type' : 'application/json', 'app_id' : 'e4f0bc81', 'app_key' : 'x562701d11fc9a9c7eff9a08805ef8ae'}
	r = requests.post("https://api.kairos.com/recognize", data=json.dumps(payload), headers=headers)
	return r

lastHadFace = False

while True:
	print 'entering loop'
	img = get_image()
	faces = detect_face(img)

	if faces is not None and len(faces) > 0 and not lastHadFace:
		raw = recognize(get_base(img)).json()
		result = raw['images'][0]['transaction']
		if result['status']  == 'failure':
			faceId = str(uuid.uuid4())
			socketIO.emit('face', {'message': 'new_face', 'faceId' : faceId})
			result = enroll(get_base(img), faceId).json()
			socketIO.emit('face', {'message': 'new_face_snap', 'faceId' : faceId})
			result = enroll(get_base(get_image()), faceId).json()
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

	time.sleep(2)