const express = require("express");
const router = express.Router();
const { dynamodb, Util } = require("../service/aws-service");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");
const MediaService = require("../service/media-service");

router.get("/", async (req, res) => {
    const allImages = await MediaService.getAllImages();
    const allVideos = await MediaService.getAllVideos();

    res.render("admin/index.ejs", { allImages, allVideos });
});

/* GET method for images and videos are available under client-api */

/**
 * Post new image with tag
 */
router.post("/images", async (req, res) => {
    var arr = [];
    console.log(req.files);
    if (Array.isArray(req.files.images) && req.files.images.length) { //multiple image
        for (var image of req.files.images) {
            const url = await Util.uploadImageAndGetUrl(image);
            arr.push(url);
            console.log("Image url: " + url);
        }
    } else if (req.files.images != null) { // single image
        const url = await Util.uploadImageAndGetUrl(req.files.images);
        arr.push(url);
        console.log("Image url: " + url);
    } else {
        req.flash("info", "No files found!");
        res.redirect("/admin");
    }

    const params = {
        RequestItems: {
            pictures: arr.map((url) => {
                return {
                    PutRequest: {
                        Item: {
                            isRecent: true,
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
                req.flash("info", "Successfully posted your images!");
                res.redirect("/admin");
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
                req.flash("info", "Successfully uploaded your video!");
                res.redirect("/admin");
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
