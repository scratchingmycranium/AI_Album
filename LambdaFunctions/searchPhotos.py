import json
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import boto3
import botocore
from datetime import datetime
import requests

s3 = boto3.resource('s3')
bucket = s3.Bucket('***')


def searchIntent(event):
    
     # elasticsearch connection
    host = "***"
    region = 'us-east-1'
    service = 'es'
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

    es = Elasticsearch(
        hosts = [{'host': host, 'port': 443}],
        http_auth = awsauth,
        use_ssl = True,
        verify_certs = True,
        connection_class = RequestsHttpConnection
    )
    
    print("ES: ", es)
    
    slots = event['currentIntent']['slots']
    
    fileNames = []
    finalResult = []
    
    for key in slots:
        print(key, slots[key])
        if str(slots[key]) != "None":
            print("slots[key] != None")
            results = es.search(q=slots[key])
            print("---results----")
            print(results)
            
            for match in results["hits"]["hits"]:
                if match['_source']['objectKey'] not in fileNames:
                    img_url = "https://" + match['_source']['bucket'] + ".s3.amazonaws.com/" + match['_source']['objectKey']
                    attachment = {
                        "attachmentLinkUrl": img_url,
                        "title": "result",
                        "imageUrl": img_url
                    }
                    finalResult.append(attachment)
                else:
                    print("is a duplicate image: ", match['_source']['objectKey'])
                
                fileNames.append(match['_source']['objectKey'])

    if len(finalResult) < 1:
        result = {
            "dialogAction": {
                "type": "Close",
                "fulfillmentState": "Fulfilled",
                "message": {
                    "contentType": "PlainText",
                    "content": "Sorry, there were no images that matched that query!"
                }
            }
        }
    else:
        result = {
            "dialogAction": {
                "type": "Close",
                "fulfillmentState": "Fulfilled",
                "message": {
                    "contentType": "PlainText",
                    "content": "Here are your requested images!"
                },
            "responseCard": {
                "version": 0,
                "contentType": "application/vnd.amazonaws.card.generic",
                "genericAttachments": finalResult
                }
            }
        }
    
    print(result)

    return result

def triggerLex(event):
    
    msg = event['queryStringParameters']["q"]
    if len(msg.split()) < 1:
        return "hello"
    elif len(msg.split()) == 1:
        msg = "show me " + msg

    client = boto3.client('lex-runtime')
    print(msg)
    
    
    response = client.post_text(
        botName="ImageSearch",
        botAlias="imageSearchAlias",
        userId="***",
        inputText= msg
    )
    
    print("response: ", response)
    results = []
    if "responseCard" in response:
        for result in response["responseCard"]["genericAttachments"]:
            
            key = result["imageUrl"].split('/')[-1]
            print(key)
            objs = list(bucket.objects.filter(Prefix=key))
            if len(objs) > 0 and objs[0].key == key:
                print("exists")
                results.append(result)
            else:
                print("doesnt exist")
    
    return results


def dispatch(intent_request):
    #Called when the user specifies an intent for this bot.
    intent_name = intent_request['currentIntent']['name']

    # Dispatch to your bot's intent handlers
    if intent_name == 'SearchIntent':
        return searchIntent(intent_request)

    raise Exception('Intent with name ' + intent_name + ' not supported')

def lambda_handler(event, context):

    if "currentIntent" not in event:
        results = triggerLex(event)
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            'body': json.dumps({"results": results})
        }
    elif "currentIntent" in event:
        print("is lex intent")
        return dispatch(event)
    else:
        return {
            'statusCode': 200,
            'body': response["message"]
        }
