const AWS = require("aws-sdk");
const projectConfig = require('../config.json');
const env = require("dotenv");

AWS.config.update({
    region: "ap-south-1",
    accessKeyId: process.env.aws_key,
    secretAccessKey: process.env.aws_secret,
});

const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

class Util {
    static async uploadImageAndGetUrl(image){
        const name = uuidv4()+image.name;
        const uploadImage = await s3.upload({
            Bucket: projectConfig.bucketName,
            Key: name,
            Body: image.data,
            ContentType:'image/jpeg'
        }).promise();
        return projectConfig.cloudfrontDomain+"/"+name;
    }
}

module.exports = {
    dynamodb,s3,Util
};
