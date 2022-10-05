const express = require("express");
const router = express.Router();
const { dynamodb, Util } = require("../service/aws-service");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");

router.get("/", async (req, res) => {
    res.send("<h1>Admin portal</h1>" + "<p>Will be added later :) </p>");
});

/* GET method for images and videos are available under client-api */

/**
 * Post new image with tag
 */
router.post("/images", async (req, res) => {
    var arr = [];
    if (req.files.images.length) {
        for (var image of req.files.images) {
            const url = await Util.uploadImageAndGetUrl(image);
            arr.push(url);
            console.log("Image url: " + url);
        }
    }

    const params = {
        RequestItems: {
            pictures: arr.map((url) => {
                return {
                    PutRequest: {
                        Item: {
                            isRecent: req.body.isRecent === "true",
                            uploadedAt: Math.trunc(Date.now() / 1000),
                            tag: req.body.tag,
                            id: url.split("/").pop(),
                            url: url,
                        },
                    },
                };
            }),
        },
    };

    await dynamodb
        .batchWrite(params)
        .promise()
        .then(
            () => {
                res.json({
                    message: "post successful",
                });
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            }
        );
});

/**
 * Update image tag
 */
router.patch("/images", async (req, res) => {
    const params = {
        TableName: config.imageTable,
        Key: {
            id: req.body.id,
        },
        UpdateExpression: `set ${req.body.updateKey} = :value`,
        ExpressionAttributeValues: {
            ":value": req.body.updateValue,
        },
        ReturnValues: "UPDATED_NEW",
    };
    await dynamodb
        .update(params)
        .promise()
        .then(
            () => {
                res.json({
                    message: "update successful",
                });
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            }
        );
});

/**
 * Delete an image with given unique id
 */
router.delete("/images", async (req, res) => {
    const params = {
        TableName: config.imageTable,
        Key: {
            id: req.body.id,
        },
        ReturnValues: "ALL_OLD",
    };
    await dynamodb
        .delete(params)
        .promise()
        .then(
            () => {
                res.json({
                    message: "delete successful",
                });
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            }
        );
});

/**
 * Upload single video at a time only :)
 */
router.post("/videos", async (req, res) => {
    const url = await Util.uploadImageAndGetUrl(req.files.thumbnail);

    const params = {
        TableName: config.videoTable,
        Item: {
            id: uuidv4(),
            description: req.body.description,
            isRecent: true,
            thumbnailUrl: url,
            uploadedAt: Math.trunc(Date.now() / 1000),
            url: req.body.url,
        },
    };

    await dynamodb
        .put(params)
        .promise()
        .then(
            () => {
                res.json({
                    message: "video saved successfully",
                });
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            }
        );
});

router.patch("/videos", async (req, res) => {
    const params = {
        TableName: config.videoTable,
        Key: {
            id: req.body.id,
        },
        UpdateExpression: `set ${req.body.updateKey} = :value`,
        ExpressionAttributeValues: {
            ":value": req.body.updateValue,
        },
        ReturnValues: "UPDATED_NEW",
    };
    await dynamodb
        .update(params)
        .promise()
        .then(
            () => {
                res.json({
                    message: "update successful",
                });
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            }
        );
});

router.delete("/videos", async (req, res) => {
    const params = {
        TableName: config.videoTable,
        Key: {
            id: req.body.id,
        },
        ReturnValues: "ALL_OLD",
    };
    await dynamodb
        .delete(params)
        .promise()
        .then(
            () => {
                res.json({
                    message: "delete successful",
                });
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            }
        );
});

module.exports = router;
