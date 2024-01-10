const express = require("express");
const router = express.Router();
const { dynamodb, Util } = require("../service/aws-service");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");
const MediaService = require("../service/media-service");

router.get("/", async (req, res) => {
    const allImages = await MediaService.getAllImages(req.session.accountId);
    const allVideos = await MediaService.getAllVideos(req.session.accountId);
    const teamInfo = await MediaService.getTeamInfoByUsername(
        req.session.username
    );
    const services = await MediaService.getServices(req.session.accountId);
    const members = await MediaService.getTeamMembers(req.session.accountId);
    const contactDetails = await MediaService.getContactDetails(
        req.session.accountId
    );
    const queries = await MediaService.getClientQueries(req.session.accountId);

    // const aboutImages = await MediaService.getAlboutImages();
    res.render("admin/index.ejs", {
        allImages,
        allVideos,
        teamInfo,
        services,
        members,
        contactDetails: contactDetails ?? {},
        queries
    });
});

/* GET method for images and videos are available under client-api */

/**
 * Post new image with tag
 */
router.post("/images", async (req, res) => {
    var arr = [];
    console.log(req.files);
    if (Array.isArray(req.files.images) && req.files.images.length) {
        //multiple image
        for (var image of req.files.images) {
            const url = await Util.uploadImageAndGetUrl(image);
            arr.push(url);
            console.log("Image url: " + url);
        }
    } else if (req.files.images != null) {
        // single image
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
                            accountId: req.session.accountId,
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
            accountId: req.session.accountId,
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
            accountId: req.session.accountId,
        },
        ReturnValues: "ALL_OLD",
    };
    await dynamodb
        .delete(params)
        .promise()
        .then(
            ({ Attributes: data }) => {
                console.log(data);
                Util.deleteImageByName(data.id);
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
            accountId: req.session.accountId,
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
            accountId: req.session.accountId,
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
            accountId: req.session.accountId,
        },
        ReturnValues: "ALL_OLD",
    };
    await dynamodb
        .delete(params)
        .promise()
        .then(
            ({ Attributes: data }) => {
                console.log(data);
                Util.deleteImageByName(data.id);
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
 * Upload about section images
 */

router.post("/home", async (req, res) => {
    var arr = [];
    console.log(req.files);
    if (Array.isArray(req.files.images) && req.files.images.length) {
        //multiple image
        for (var image of req.files.images) {
            const url = await Util.uploadImageAndGetUrl(image);
            arr.push(url);
            console.log("Image url: " + url);
        }
    } else if (req.files.images != null) {
        // single image
        const url = await Util.uploadImageAndGetUrl(req.files.images);
        arr.push(url);
        console.log("Image url: " + url);
    } else {
        req.flash("info", "No image files found!");
        res.redirect("/admin");
    }

    const params = {
        TableName: config.homeTable,
        Item: {
            accountId: req.session.accountId,
            uploadedAt: Math.trunc(Date.now() / 1000),
            images: arr,
            homePageTitle: req.body.title,
            homePageDescription: req.body.description,
        },
    };

    await dynamodb
        .put(params)
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
 * About Section
 */
router.post("/about", async (req, res) => {
    let bannerUrl;

    if (req.files.bannerImage != null) {
        // single image
        bannerUrl = await Util.uploadImageAndGetUrl(req.files.bannerImage);
        console.log("Image url: " + bannerUrl);
    }

    const params = {
        TableName: config.aboutTable,
        Item: {
            accountId: req.session.accountId,
            uploadedAt: Math.trunc(Date.now() / 1000),
            bannerUrl,
            introVideoUrl: req.body.introVideoUrl,
            aboutUsTitle: req.body.aboutUsTitle,
            aboutUsDescription: req.body.aboutUsDescription,
        },
    };

    await dynamodb
        .put(params)
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
 * Delete an image with given unique id
 */
router.delete("/about", async (req, res) => {
    const params = {
        TableName: config.aboutTable,
        Key: {
            id: req.body.id,
        },
        ReturnValues: "ALL_OLD",
    };
    await dynamodb
        .delete(params)
        .promise()
        .then(
            ({ Attributes: data }) => {
                console.log(data);
                Util.deleteImageByName(data.id);
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
 * Post new Service quotes
 */
router.post("/quotes", async (req, res) => {
    let url = null;
    if (req.files.images != null) {
        // single image
        url = await Util.uploadImageAndGetUrl(req.files.images);
        console.log("Image url: " + url);
    } else {
        req.flash("info", "No files found!");
        res.redirect("/admin");
    }

    const data = {
        title: req.body.title,
        description: req.body.description,
        quotePrice: req.body.quotePrice,
    };

    const params = {
        TableName: config.serviceQuotes,
        Item: {
            id: uuidv4(),
            accountId: req.session.accountId,
            iconUrl: url,
            detailsJson: JSON.stringify(data),
            uploadedAt: Math.trunc(Date.now() / 1000),
        },
    };

    await dynamodb
        .put(params)
        .promise()
        .then(
            () => {
                req.flash("info", "Successfully posted your service!");
                res.redirect("/admin");
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            }
        );
});

/**
 * Delete quotes
 */
router.delete("/quotes", async (req, res) => {
    const params = {
        TableName: config.serviceQuotes,
        Key: {
            id: req.body.id,
            accountId: req.session.accountId,
        },
        ReturnValues: "ALL_OLD",
    };
    await dynamodb
        .delete(params)
        .promise()
        .then(
            ({ Attributes: data }) => {
                console.log(data);
                Util.deleteImageByName(data.id);
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
 * Add new member
 */
router.post("/members", async (req, res) => {
    let url = null;
    if (req.files.images != null) {
        // single image
        url = await Util.uploadImageAndGetUrl(req.files.images);
        console.log("Image url: " + url);
    } else {
        req.flash("info", "No files found!");
        res.redirect("/admin");
    }

    const params = {
        TableName: config.teamTable,
        Item: {
            serialNo: uuidv4(),
            accountId: req.session.accountId,
            profilePicture: url,
            name: req.body.name,
            role: req.body.role,
            facebookProfile: req.body.facebookProfile,
            instagramProfile: req.body.instagramProfile,
            uploadedAt: Math.trunc(Date.now() / 1000),
        },
    };

    await dynamodb
        .put(params)
        .promise()
        .then(
            () => {
                req.flash("info", "Successfully posted your service!");
                res.redirect("/admin");
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            }
        );
});

/**
 * Delete Member
 */
router.delete("/members", async (req, res) => {
    const params = {
        TableName: config.teamTable,
        Key: {
            serialNo: req.body.id,
            accountId: req.session.accountId,
        },
        ReturnValues: "ALL_OLD",
    };
    await dynamodb
        .delete(params)
        .promise()
        .then(
            ({ Attributes: data }) => {
                console.log(data);
                Util.deleteImageByName(data.id);
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

router.post("/contact", async (req, res) => {
    const params = {
        TableName: config.contactDetails,
        Item: {
            accountId: req.session.accountId,
            name: req.body.name,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            address: req.body.address,
            locationUrl: req.body.locationUrl,
        },
    };

    await dynamodb
        .put(params)
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
 * Delete Member
 */
router.delete("/query", async (req, res) => {
    const params = {
        TableName: config.clientQuery,
        Key: {
            id: req.body.id,
            accountId: req.session.accountId,
        },
        ReturnValues: "ALL_OLD",
    };
    await dynamodb
        .delete(params)
        .promise()
        .then(
            ({ Attributes: data }) => {
                console.log(data);
                Util.deleteImageByName(data.id);
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
