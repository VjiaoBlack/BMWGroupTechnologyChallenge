# BMW Tech Challenge
### Victor Jiao

## Problem
You have a lot of cars reporting traffic signs, and you want to have an app so that they can submit (longitude, latitude, sign_type) data packets to a central database, and also query (longitude, latitude, radius) and get a set of signs within <radius> of the specified point. We only want to return one sign of each type within the radius, however.

## Design
The app is coded with Mongo, Node.js, and Express.js. You can go to https://radiant-cliffs-86975.herokuapp.com/ to submit, and https://radiant-cliffs-86975.herokuapp.com/view to view. There's both a human-facing and JSON-based interface. You access the human-facing interface by filling out the form and clicking submit - there's basic error handling that prevents invalid data from entering the database (and the human form will refresh with the error messages). The JSON interface (by submitting a PUSH request from a program to the same URL) will lead to the same behavior (where invalid data won't be inserted). 

You can 'search' for traffic signs again with the /view human interface, or by making POST requests to /view (with the additional tag type=json). Instead of returning HTML, the backend will return a JSON of found traffic signs. An example can be found in store_data.py and test.py.

store_data.py puts some test data into the database (you shouldn't have to run this) and test.py just runs a sample query and prints the result to the command line.

The data is stored and retrieved from MongoDB. 