#!/bin/python

import requests
import json

url = "https://radiant-cliffs-86975.herokuapp.com"

traffic_sign_types = json.load(open('traffic_sign_types.json'))
print(traffic_sign_types)

for i in range(0, len(traffic_sign_types)):
	for j in range(0, 5):
		r = requests.post(url + "/", data={\
				'longitude': 40.0 + 1.0 * i / 100.0, \
				'latitude': 40.0 + 1.0 * j / 100.0, \
				'signtype': traffic_sign_types[i]})
		print(str(i) + " " + str(j) + " " + str((r.status_code, r.reason)))
