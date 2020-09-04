'use strict';

const AWS = require('aws-sdk');

// Set the Region 
AWS.config.update({
  accessKeyId: '***',
  secretAccessKey: '***',
  region: 'us-east-1',
  signatureVersion: 'v4'
});

// Create the S3 service object
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
    
    const bucket = event.queryStringParameters.bucket
    const key = event.queryStringParameters.key
    const ContentType = event.queryStringParameters.filetype
    
    console.log(bucket);
    console.log(key);
    console.log(ContentType)
    
    
    if (!bucket) {
        callback(new Error('bucket name missing'))
    }
    
    if (!key) {
        callback(new Error('S3 object key missing'))
    }
    
    if (!ContentType) {
        callback(new Error('ContentType is missing'))
    }
    
    const params = {
        'Bucket': bucket,
        'Key': key,
        'ACL': 'public-read',
        "ContentType": ContentType
    };
    
    const signedURL= await s3.getSignedUrl('putObject', params)
    
    console.log(signedURL)
    const response = {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods":"GET,OPTIONS"
        },
        'body': signedURL
    };
    
    return response;
};
