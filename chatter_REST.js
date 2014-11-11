var http = require('http');
var https = require('https');
var url = require('url');
var express = require('express');
var cors = require('cors');
var app  = express();

app.use(cors());
app.use("/static", express.static(process.env.PWD + "/static"));

function httpsCall(httpOptions, body, callback) {
 	var req = https.request(httpOptions, function(res) {
 		var body = '';

    	res.on('data', function(d) {
			body += d;
		});

		res.on('end', function() {
			callback(body, res.headers);
		});
	});

	if (body) {
		req.write(body);
	}
	req.end();

	req.on('error', function(e) {
		console.error(e);
	});
}

function httpsCallBinary(httpOptions, body, callback) {
 	var req = https.request(httpOptions, function(res) {
 		console.log('BINARY CALL FIRED');
 		var body = '';
 		res.setEncoding('binary');

    	res.on('data', function(chunk) {
			body += chunk;
		});

		res.on('end', function() {
			callback(body, res.headers);
		});
	});
	req.end();

	req.on('error', function(e) {
		console.error(e);
	});
}

app.post('/chatterService', function(req, res) {
	req.on('data', function (chunk) {
		postedData = JSON.parse(chunk.toString());
		console.log(postedData.RESOURCE);
		TOKEN = postedData.SF_TOKEN;
		var httpOptions;
		var body;
		if (postedData.ACTION == 'GET') {
			console.log('GET ' + postedData.RESOURCE);
			httpOptions = {
			      hostname: postedData.SF_INSTANCE,
			      port: 443,
			      path: postedData.RESOURCE,
			      method: 'GET',
			      headers :
			      {
			          'Authorization' : 'Bearer ' + TOKEN
			        }
			};
		} else if (postedData.ACTION == 'POST') {
			console.log('POST ' + postedData.RESOURCE);
			httpOptions = {
			      hostname: postedData.SF_INSTANCE,
			      port: 443,
			      path: postedData.RESOURCE,
			      method: 'POST',
			      headers :
			      {
			          'Authorization' : 'Bearer ' + TOKEN,
			          'Content-type' : 'application/json'
			        }
			};
		} else if (postedData.ACTION == 'PATCH') {
			console.log('PATCH ' + postedData.RESOURCE);
			httpOptions = {
			      hostname: postedData.SF_INSTANCE,
			      port: 443,
			      path: postedData.RESOURCE,
			      method: 'PATCH',
			      headers :
			      {
			          'Authorization' : 'Bearer ' + TOKEN,
			          'Content-type' : 'application/json'
			        }
			};
		} else if (postedData.ACTION == 'DOWNLOAD') {
			console.log('DOWNLOAD ' + postedData.RESOURCE);
			httpOptions = {
			      hostname: postedData.SF_INSTANCE,
			      port: 443,
			      path: postedData.RESOURCE,
			      method: 'GET',
			      headers :
			      {
			          'Authorization' : 'Bearer ' + TOKEN
			        }
			};
		}
		body = JSON.stringify(postedData.BODY);

		var responseCallback = function(data, headers) {
			res.setHeader('Content-Length', Buffer.byteLength(data));
			res.setHeader('Content-type', headers['content-type']);
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.end(data);
			console.log('responsed.', headers['content-type']);
		}

		var responseCallbackBinary = function(data, headers) {
			//res.setHeader('Content-Length', Buffer.byteLength(data));
			res.setHeader('Content-type', headers['content-type']);
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.end(data, 'binary');
			console.log('responsed.', headers['content-type']);
		}

		if (postedData.ACTION == 'DOWNLOAD') {
			httpsCallBinary(httpOptions, body, responseCallbackBinary);
		} else {
			httpsCall(httpOptions, body, responseCallback);
		}
	});

});



var port = Number(process.env.PORT || 3333); 
app.listen(port, function() {
	console.log('listening on port ' + port);
}); 

