#!/bin/python

import requests
import json
import pprint

url = "https://radiant-cliffs-86975.herokuapp.com"

r = requests.post(url + "/view", data={'longitude': 40.01, 'latitude': 40.01, 'radius': 0.02, 'type': 'json'})
print(r.status_code, r.reason)

pp = pprint.PrettyPrinter(indent=2)
json_data = json.loads(r.text)
pp.pprint(json_data)