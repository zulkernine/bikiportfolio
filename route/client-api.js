const express = require("express");
const router = express.Router();
const { dynamodb, Util } = require("../service/aws-service");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");

router.get("/", async (req, res) => {
    res.status(404).send("<h1>this is for clients :)</h1>");
});

/**
 * Return all images available sorted by uploadedAt timestamp (latest first or Decrasing)
 */
router.get("/images", async (req, res) => {
    try {
        const allImages = await getAllDynamoImages();
        allImages.sort((a, b) => b.uploadedAt - a.uploadedAt);
        res.json(allImages);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/images/recent", async (req, res) => {
    try {
        const allImages = (await getAllDynamoImages())
            .filter((img) => img["isRecent"]);
        allImages.sort((a, b) => b.uploadedAt - a.uploadedAt);
        
        res.json(allImages);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/videos", async (req, res) => {
    try {
        const allVideos = await getAllDynamoVideos();
        allVideos.sort((a, b) => b.uploadedAt - a.uploadedAt);
        res.json(allVideos);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/videos/recent", async (req, res) => {
    try {
        const allVideos = (await getAllDynamoVideos())
            .filter((vid) => vid.isRecent);
        allVideos.sort((a, b) => b.uploadedAt - a.uploadedAt);
        res.json(allVideos);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;

/* Following functions are for internal use only */

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
