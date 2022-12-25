const { dynamodb, Util } = require("./aws-service");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");

class MediaService {
    static async getAllImages() {
        const allImages = await getAllDynamoImages();
        allImages.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allImages;
    }

    static async getRecentImages() {
        const allImages = (await getAllDynamoImages()).filter(
            (img) => img["isRecent"]
        );
        allImages.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allImages;
    }

    static async getAllVideos() {
        const allVideos = await getAllDynamoVideos();
        allVideos.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allVideos;
    }

    static async getRecentVideos() {
        const allVideos = (await getAllDynamoVideos()).filter(
            (vid) => vid.isRecent
        );
        allVideos.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allVideos;
    }

    static async getAllTeamMembers(){
        const members = (await getAllTeamMembers());
        members.sort((a, b) => a.serialNo - b.serialNo);
        return members;
    }
}

module.exports = MediaService;

async function getAllDynamoImages() {
    const params = {
        TableName: config.imageTable,
    };
    return await scanDynamoTable(params, []);
}

async function getAllDynamoVideos() {
    const params = {
        TableName: config.videoTable,
    };
    return await scanDynamoTable(params, []);
}

async function getAllTeamMembers(){
    const params = {
        TableName: config.teamTable,
    };
    return await scanDynamoTable(params, []);
}

async function scanDynamoTable(params, items) {
    try {
        const dynamodata = await dynamodb.scan(params).promise();
        items = items.concat(dynamodata.Items);
        if (dynamodata.LastEvaluatedKey) {
            params.ExclusiveStartKey = dynamodata.LastEvaluatedKey;
            return await scanDynamoTable(params, items);
        }
        return items;
    } catch (e) {
        throw Error(e);
    }
}
