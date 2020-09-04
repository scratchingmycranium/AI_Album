# Live site: https://d10mck35okytrm.cloudfront.net/

### Created by:
Simcha Coleman

### Architecture Diagram:
![alt text](https://github.com/scratchingmycranium/AI_Album/blob/master/AiPhotoAlbumFlow-1.png "ARchitecture Diagram")
The application also uses CloudFront to serve the Frontend.

### Walkthrough:
![alt text](https://github.com/scratchingmycranium/AI_Album/blob/master/ai_album.gif "Walkthrough")

#### Notes:
Because this is a serverless application and utilizes AWS Lambda as the backend, the application will not work if you just clone the repo and `npm install` `npm start`. You would need to create Lambda functions in AWS and direct the API calls to your API Gateway endpoints. Additionally, for Cognito to work, you need to configure Cognito in your CLI or the AWS Console and add `aws-exports.json` with the correct parameters.

aws-exports.json:

```json
{
   "userPoolRegion": "us-east-1",
   "userPoolId": "***",
   "userPoolWebClientId": "***",
   "endpoints": [
     {
       "name": "AI Photo Search",
       "endpoint": "***",
       "region": "us-east-1"
     }
   ]
 }

```

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
