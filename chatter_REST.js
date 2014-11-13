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
	});
}

app.post('/chatterService', function(req, res) {
	req.on('data', function (chunk) {
		postedData = JSON.parse(chunk.toString());
		TOKEN = postedData.SF_TOKEN;
		var httpOptions;
		var body;
		if (postedData.ACTION == 'GET') {
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
		}

		var responseCallbackBinary = function(data, headers) {
			//res.setHeader('Content-Length', Buffer.byteLength(data));
			res.setHeader('Content-type', headers['content-type']);
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.end(data, 'binary');
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
}); 

