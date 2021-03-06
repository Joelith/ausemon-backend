var express = require('express');
var bodyParser = require('body-parser');
var oracledb = require('oracledb');
var sanitizer = require('sanitizer');

var PORT = process.env.PORT || 8089;

var app = express();

var connectionProperties = {
 	user: process.env.DBAAS_USER_NAME || "oracle",
  password: process.env.DBAAS_USER_PASSWORD || "password",
  connectString: process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR || "URL"
};

function doRelease(connection) {
  connection.release(function (err) {
    if (err) {
      console.error(err.message);
    }
  });
}

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));

var router = express.Router();
router.use(function (request, response, next) {
  console.log("REQUEST:" + request.method + "   " + request.url);
  console.log("BODY:" + JSON.stringify(request.body));
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Now create the routes
router.route('/').get(function(request, response) {
	response.status(200).send("Server working");
});

router.route('/animals').get(function (request, response) {
	oracledb.getConnection(connectionProperties, function (err, connection) {
		if (err) {
			console.error(err.message);
			response.status(500).send("Error connecting to DB: " + err.message);
			return;
		}
		connection.execute("SELECT * FROM ANIMALS ORDER BY COMMON_NAME",function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        console.log("RESULTSET:" + JSON.stringify(result));
        var animals = [];
        result.rows.forEach(function (element) {
          animals.push({ 
          	id: element[0], 
          	name: element[1],
          	scientific_name: element[2],
            guid: element[3],
            description: element[4]
         	});
        }, this);
        response.json({animals: animals});
        doRelease(connection);
     });
	})
});


router.route('/animals/nearby').get(function (request, response) {
  var lat = sanitizer.escape(request.query.lat);
  var lon = sanitizer.escape(request.query.lon);

  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB: " + err.message);
      return;
    }
    connection.execute("SELECT c.ID, b.COMMON_NAME AS COMMON_NAME, ROUND(AVG(SDO_GEOM.SDO_DISTANCE(a.LOCATION, SDO_GEOMETRY('POINT(" + lon + " " + lat + ")', 4326), 1, 'unit=M'))) as DISTANCE FROM GEO_TEMP a, TOP_OCCURRENCES b, ANIMALS c WHERE SDO_WITHIN_DISTANCE(a.LOCATION,SDO_GEOMETRY('POINT(" + lon + " " + lat + ")', 4326), 'distance=1 unit=KM') ='TRUE' AND b.COMMON_NAME IS NOT NULL AND b.COMMON_NAME = c.COMMON_NAME AND a.OCCURRENCE_NUMBER = b.OCCURRENCE_NUMBER GROUP BY c.ID, b.COMMON_NAME ORDER BY DISTANCE", [], function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB. Probably invalid lat/lon: " + lat + ":" + lon);
          doRelease(connection);
          return;
        }
        console.log("RESULTSET:" + JSON.stringify(result));
        var animal = {};
        if (result.rows.length < 1) {
          response.status(400).send("No animals found nearby");
          return;
        }
        var animals = [];
        result.rows.forEach(function (element) {
          animals.push({ 
            id: element[0], 
            name: element[1],
            distance: element[2]
          });
        }, this);
        response.json(animals);
        doRelease(connection);
     });
  })
});


router.route('/animals/:id').get(function (request, response) {
	var id = sanitizer.escape(request.params.id);
	oracledb.getConnection(connectionProperties, function (err, connection) {
		if (err) {
			console.error(err.message);
			response.status(500).send("Error connecting to DB: " + err.message);
			return;
		}
		connection.execute("SELECT * FROM ANIMALS WHERE ID = :id", [id], function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        console.log("RESULTSET:" + JSON.stringify(result));
        var animal = {};
        if (result.rows.length < 1) {
        	response.status(400).send("Animal of id: " + id + " not found");
        	return;
        }
        result.rows.forEach(function (element) {
          animal.id = element[0];
          animal.name = element[1];
          animal.scientific_name = element[2];
          animal.guid = element[3];
          animal.description = element[4];
        }, this);
        response.json(animal);
        doRelease(connection);
     });
	})
});


console.log('App started on', PORT);
app.use('/', router);
app.listen(PORT);