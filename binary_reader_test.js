var postedData = 
{SF_INSTANCE: "eu3.salesforce.com", 
SF_TOKEN: 
'00Dw0000000n1Ef!AQoAQDOfArdyk9zVX6Zx9iTjPserc1FqruXk4_i6RJna8L9qezkZ5dW76JX085GKvjo6EAglwzpYgW5Z_VWvzT80rq8ZFBLs'
,
RESOURCE: "/services/data/v32.0/chatter/files/069w00000022RVgAAM/content?versionNumber=1", ACTION: "DOWNLOAD"};

var https = require('https')
  , fs = require('fs')
  , options

/*var      httpOptions = {
            hostname: postedData.SF_INSTANCE,
            port: 443,
            path: postedData.RESOURCE,
            method: 'GET',
            headers :
            {
                'Authorization' : 'Bearer ' + postedData.SF_TOKEN
              }
      };*/


var      httpOptions = {
            hostname: "afternoon-tundra-4730.herokuapp.com",
            port: 443,
            path: '/chatterService',
            method: 'POST',
            /*headers :
            {
                'Authorization' : 'Bearer ' + "00Dw0000000n1Ef!AQoAQGIapLwSyz3.7N2d3qTg1oPIe7jBUneZZpIZmBy6JexvgTCq3gZPJDwy3G0ulLx_bQNXdxDYUaGe3wD.qAOjOIRgS7Qc"
                'Content-type' : 'application/json'
              }*/
      };

      

var params = {SF_INSTANCE: "eu3.salesforce.com", 
SF_TOKEN: "00Dw0000000n1Ef!AQoAQDllfWHt_uzygp6yqkxrDs2Be_QvolgnOFQtddXq2tyrAOTqmfzM6RDOXRwN8p_5KJQnwmks.GMl.n5gkhtnAKq_nNFI", 
RESOURCE: "/services/data/v32.0/chatter/files/069w00000022QfGAAU/content?versionNumber=1", ACTION: "DOWNLOAD"};


  var req = https.request(httpOptions, function(res) {
    var body = '';
    res.setEncoding('binary')

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
        fs.writeFile('logo', body, 'binary', function(err){
            if (err) throw err
        })
    });
  });
  req.end(JSON.stringify(params));

  req.on('error', function(e) {
  });


/*
var request = https.get(httpOptions, function(res){
    var imagedata = '';
    res.setEncoding('binary')

    res.on('data', function(chunk){
        imagedata += chunk
    })

    res.on('end', function(){

    })

})

request.write(JSON.stringify(params));
request.end();
*/
