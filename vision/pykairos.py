#!/usr/bin/python
# -*- coding: utf-8 -*-

import base64, time, uuid, requests, cStringIO, cv2, json
from socketIO_client  import SocketIO, LoggingNamespace, BaseNamespace 

from picamera.array import PiRGBArray
from picamera import PiCamera

camera = PiCamera()
camera.rotation = 180
time.sleep(0.5)

HOST = 'localhost'
GROUP = 'xfacecroptest2'

socketIO = SocketIO('http://' + HOST, 3000, LoggingNamespace)

def get_image():
	print 'Capturing'
	rawCapture = PiRGBArray(camera)
	camera.capture(rawCapture, format="bgr")
	image = rawCapture.array
	return crop_center(image)

def capture_face():
	img = get_image()
	faces = detect_face(img)
	print faces
	if faces is not None and len(faces) > 0:
		cutFace = selectAndCrop(img, faces)
		return cutFace

def crop_center(image):
	height = len(image)
	width = len(image[0])
	return image[height*0.1:height*0.8,width*0.2:width*0.8]

def save_image(image):
	cv2.imwrite(str(time.time()) + '.png', image) 

def show_image(image):
	print str(len(image)) + ', ' + str(len(image[0]))
	cv2.imshow('image',image)
	cv2.waitKey(0)
	cv2.destroyAllWindows()

def get_base(image):
	cnt = cv2.imencode('.png',image)[1]
	b64 = base64.encodestring(cnt)
	return b64

def detect_face(image):
	print 'Detecting face'
	face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
	faces = face_cascade.detectMultiScale(image, 1.3, 5)
	return faces

def enroll(image, user):
	payload = { 'gallery_name': GROUP, 'selector' : 'FACE'}
	payload['image'] = image 
	payload['subject_id'] = user
	headers = {'Content-Type' : 'application/json', 'app_id' : 'e4f0bc81', 'app_key' : 'a562701d11fc9a9c7eff9a08805ef8ae'}
	r = requests.post("https://api.kairos.com/enroll", data=json.dumps(payload), headers=headers)
	return r

def recognize(image):
	payload = { 'gallery_name': GROUP, 'threshold':0.75, 'max_num_results' : 3}
	payload['image'] = image
	headers = {'Content-Type' : 'application/json', 'app_id' : 'e4f0bc81', 'app_key' : 'a562701d11fc9a9c7eff9a08805ef8ae'}
	r = requests.post("https://api.kairos.com/recognize", data=json.dumps(payload), headers=headers)
	return r

def selectCentered(size, faces):
	finalFace = None
	finalDiff = 10000000
	for face in faces:
		leftDistance = face[0]
		rightDistance = size[0] - face[0] + face[2]
		diff = abs(leftDistance - rightDistance)
		if diff < finalDiff:
			finalDiff = diff
			finalFace = face
	return finalFace

def selectAndCrop(img, faces):
	#(x,y,w,h)
	faceRect = selectCentered([len(img), len(img[0])], faces)
	return img[(faceRect[1] - 25):faceRect[1] + faceRect[3] + 25, (faceRect[0] - 15):faceRect[0] + faceRect[2] + 15]

lastHadFace = False
get_image()

while True:
	start = time.time()
	face = capture_face()
	print 'time to capture face ' + str(time.time()-start)
	if face is not None and not lastHadFace:
		socketIO.emit('face', {'message': 'face_detected'})
		raw = recognize(get_base(face)).json()
		print 'time to recognize face ' + str(time.time()-start)
		if 'images' in raw and len(raw['images']) > 0:
			result = raw['images'][0]['transaction']
			if result['status']  == 'failure':
				print 'New One'
				faceId = str(uuid.uuid4())
				socketIO.emit('face', {'message': 'new_face', 'faceId' : faceId})
				secondImage = capture_face()
				result = enroll(get_base(face), faceId).json()
				print 'time to enroll face ' + str(time.time()-start)
				if secondImage is not None:
					result = enroll(get_base(secondImage), faceId).json()
					print 'time to enroll biu face ' + str(time.time()-start)
				lastHadFace = True
				print result
			else :
				print result['subject']
				socketIO.emit('face', {'message': 'known_face', 'faceId' :  result['subject'], 'confidence' : result['confidence']})
				print result['status'] + ', ' + result['subject'] + ', ' + result['confidence']
				lastHadFace = True
				print 'New Face'
	elif face is None and lastHadFace:
		lastHadFace = False
		socketIO.emit('face', {'message': 'no_face_now'})
		print 'No face now'
	else:
		print 'No changes...'

	time.sleep(2)
