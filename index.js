var express = require('express');
var bodyParser = require('body-parser');
var oracledb = require('oracledb');
var sanitizer = require('sanitizer');

var PORT = process.env.PORT || 8089;

var app = express();

var connectionProperties = {
 	user: process.env.DBAAS_USER_NAME || "AUSEMON",
  password: process.env.DBAAS_USER_PASSWORD || "Ausemon1",
  connectString: process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR || "141.145.27.31:1521/PDB1.gse00000535.oraclecloud.internal"
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
		connection.execute("SELECT * FROM ANIMALS",function (err, result) {
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
          	description: element[2]
         	});
        }, this);
        response.json({animals: animals});
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
          animal.id = element[0], 
          animal.name = element[1],
          animal.description =element[2]
        }, this);
        response.json(animal);
        doRelease(connection);
     });
	})
});
console.log('App started on', PORT);
app.use('/', router);
app.listen(PORT);