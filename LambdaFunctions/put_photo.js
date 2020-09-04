const AWS = require('aws-sdk');

var s3 = new AWS.S3();

exports.handler = (event, context, callback) => {   
    console.log(event)
     let encodedImage =JSON.parse(event.body).img;
     let decodedImage = new Buffer.from(encodedImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');
     
     // name doesn't matter, we'll randomly generate one
     var filePath = Math.floor(Math.random()*10000000).toString() + ".jpg"
     
     var params = {
       "Body": decodedImage,
       "Bucket": "***",
       "Key": filePath,
       "ContentType": "image/jpeg",
       "ACL":'public-read-write'
    };
    s3.upload(params, function(err, data){
       if(err) {
           callback(err, null);
       } else {
           let response = {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify(data),
        "isBase64Encoded": false
    };
           callback(null, response);
    }
    });
    
};
